package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	firebase "firebase.google.com/go"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"google.golang.org/api/option"
)

const subTopic = "homemqtt/station/villarosa/"

func main() {
	mqtt.CRITICAL = log.New(os.Stdout, "", 0)
	mqtt.ERROR = log.New(os.Stdout, "", 0)
	opts := mqtt.NewClientOptions().AddBroker("tcp://192.168.21.21:1883").SetClientID("emqx_test_client")

	opts.SetKeepAlive(60 * time.Second)
	opts.SetDefaultPublishHandler(f)
	opts.SetPingTimeout(1 * time.Second)

	c := mqtt.NewClient(opts)
	if token := c.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	app, err := firebaseLogin()
	if err != nil {
		panic(err)
	}
	id, err := app.InstanceID(context.Background())
	if err != nil {
		panic(err)
	}
	log.Printf("ID: %v\n", id)

	wp := weatherPacket{app: app}
	// Subscribe to a topic
	if token := c.Subscribe(subTopic+"#", 0, wp.updatePack); token.Wait() && token.Error() != nil {
		fmt.Println(token.Error())
		os.Exit(1)
	}

	select {}
}

func firebaseLogin() (*firebase.App, error) {
	opt := option.WithCredentialsFile("/data/bietsbot-firebase.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}
	return app, nil
}

var f mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
	fmt.Printf("TOPIC: %s\n", msg.Topic())
	fmt.Printf("MSG: %s\n", msg.Payload())
}

type weatherPacket struct {
	temperature *string
	humidity    *string
	pressure    *string
	battery     *string
	lock        sync.RWMutex
	app         *firebase.App
}

func (w *weatherPacket) updatePack(client mqtt.Client, msg mqtt.Message) {
	w.lock.Lock()
	defer w.lock.Unlock()

	topic := msg.Topic()
	value := string(msg.Payload())

	subTopic := strings.TrimPrefix(topic, subTopic)

	switch subTopic {
	case "temperature":
		w.temperature = &value
	case "presure":
		w.pressure = &value
	case "humidity":
		w.humidity = &value
	case "battery":
		w.battery = &value
	}

	w.checkSend()
}

func (w *weatherPacket) ready() bool {
	return !(w.temperature == nil || w.humidity == nil || w.pressure == nil || w.battery == nil)
}

func (w *weatherPacket) checkSend() {
	if !w.ready() {
		return
	}

	w.send()
	w.temperature = nil
	w.humidity = nil
	w.pressure = nil
	w.battery = nil
}

func (w *weatherPacket) send() {
	ctx := context.Background()
	client, err := w.app.Firestore(ctx)
	if err != nil {
		log.Printf("Could not open db: %v\n", err)
		return
	}

	col := client.Collection("weather_stations")
	t := fmt.Sprintf("%v", time.Now().UTC().Unix())
	doc := col.Doc(t)
	f := firebaseEntry{
		Temperature: *w.temperature,
		Humidity:    *w.humidity,
		Pressure:    *w.pressure,
		Battery:     *w.battery,
		Time:        t,
	}
	_, err = doc.Set(ctx, &f)

	if err != nil {
		log.Printf("Could not write to db: %v\n", err)
	}
	log.Printf("%s\n", f)
}

type firebaseEntry struct {
	Temperature string `json:"temperature"`
	Humidity    string `json:"humidity"`
	Pressure    string `json:"pressure"`
	Battery     string `json:"battery"`
	Time        string `json:"time"`
}

func (f firebaseEntry) String() string {
	return fmt.Sprintf("Temperature: %s, Humidity: %s, Pressure: %s, Battery: %s, Time: %s", f.Temperature, f.Humidity, f.Pressure, f.Battery, f.Time)
}
