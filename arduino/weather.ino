/***************************************************
  Weather station Arduino code

  Based on Adafruit MQTT Library WINC1500 Example
 ****************************************************/
#include <SPI.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"
#include <WiFi101.h>
#include <Wire.h>
#include "RTCZero.h"
#include "ArduinoLowPower.h"
#include "SparkFunBME280.h"
#include <Adafruit_SleepyDog.h>

/************************* WiFI Setup *****************************/
#define WINC_CS 8
#define WINC_IRQ 7
#define WINC_RST 4
#define WINC_EN 2

char ssid[] = "<SSID>";
char pass[] = "<WIFI_PASSWORD>";
int keyIndex = 0;

int status = WL_IDLE_STATUS;

/************************* MQTT Setup *********************************/

#define AIO_SERVER "<Server IP>"
#define AIO_SERVERPORT 1883
#define AIO_USERNAME "<MQTT_USER>"
#define AIO_KEY "<MQTT_PASSWORD>"
#define STATION_NAME "<STATION_NAME>"

WiFiClient client;

Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

#define halt(s)               \
    {                         \
        Serial.println(F(s)); \
        while (1)             \
            ;                 \
    }

Adafruit_MQTT_Publish temperature = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/station/" + STATION_NAME + "/temperature");
Adafruit_MQTT_Publish presure = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/station/" + STATION_NAME + "/presure");
Adafruit_MQTT_Publish humidity = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/station/" + STATION_NAME + "/humidity");
Adafruit_MQTT_Publish battery = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/station/" + STATION_NAME + "/battery");

#define LEDPIN 13
BME280 mySensor;
#define VBATPIN A7

volatile bool alarmWent = false;
volatile unsigned long alarmCount = 0;
int alarmMinute = 0;

byte nextAlarmSecond = 0;

RTCZero rtc;

void setup()
{
    WiFi.setPins(WINC_CS, WINC_IRQ, WINC_RST, WINC_EN);

    //  while (!Serial);
    Serial.begin(115200);

    delay(10000);

    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println(F("Adafruit MQTT demo for WINC1500"));

    Serial.print(F("\nInit the WiFi module..."));
    if (WiFi.status() == WL_NO_SHIELD)
    {
        Serial.println("WINC1500 not present");
        while (true)
            ;
    }
    Serial.println("ATWINC OK!");
    WiFi.lowPowerMode();

    Wire.begin();
    Wire.setClock(400000);

    mySensor.beginI2C();

    mySensor.setMode(MODE_SLEEP);

    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
    digitalWrite(LED_BUILTIN, HIGH);
    int countdownMS = Watchdog.enable(16000);

    rtc.begin();
    rtc.attachInterrupt(alarmIRQ);
    rtc.setTime(0, 0, 0);

    nextAlarmSecond = 10;
    rtc.setAlarmTime(0, 0, nextAlarmSecond);
    nextAlarmSecond = (nextAlarmSecond + 10) % 60;
    rtc.enableAlarm(rtc.MATCH_SS);
}

uint32_t x = 0;

void loop()
{
    Serial.end();
    digitalWrite(LED_BUILTIN, LOW);

    LowPower.sleep();

    Serial.begin(115200);
    Serial.println("Awakened");

    if (alarmWent)
    {
        Watchdog.reset();
        if (alarmCount > 5)
        {
            digitalWrite(LED_BUILTIN, HIGH);
            alarmCount = 0;
            alarmMinute++;

            measure();
            digitalWrite(LED_BUILTIN, LOW);
        }

        rtc.setAlarmTime(0, 0, nextAlarmSecond);
        nextAlarmSecond = (nextAlarmSecond + 10) % 60;
        rtc.enableAlarm(rtc.MATCH_SS);

        alarmWent = false;
    }
}

void measure()
{
    MQTT_connect();

    mySensor.setMode(MODE_FORCED);

    long startTime = millis();
    while (mySensor.isMeasuring() == false)
        ;
    while (mySensor.isMeasuring() == true)
        ;
    long endTime = millis();

    float measuredvbat = analogRead(VBATPIN);
    measuredvbat *= 2;
    measuredvbat *= 3.3;
    measuredvbat /= 1024;

    if (!temperature.publish(mySensor.readTempC()))
    {
        Serial.println(F("Failed"));
    }
    if (!presure.publish(mySensor.readFloatPressure()))
    {
        Serial.println(F("Failed"));
    }
    if (!humidity.publish(mySensor.readFloatHumidity()))
    {
        Serial.println(F("Failed"));
    }
    if (!battery.publish(measuredvbat))
    {
        Serial.println(F("Failed"));
    }
}

void MQTT_connect()
{
    int8_t ret;

    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print("Attempting to connect to SSID: ");
        Serial.println(ssid);
        status = WiFi.begin(ssid, pass);

        uint8_t timeout = 10;
        while (timeout && (WiFi.status() != WL_CONNECTED))
        {
            timeout--;
            delay(1000);
        }
    }

    if (mqtt.connected())
    {
        return;
    }

    Serial.print("Connecting to MQTT... ");

    while ((ret = mqtt.connect()) != 0)
    {
        Serial.println(mqtt.connectErrorString(ret));
        Serial.println("Retrying MQTT connection in 5 seconds...");
        mqtt.disconnect();
        delay(5000);
    }
    Serial.println("MQTT Connected!");
}

void alarmIRQ()
{
    alarmWent = true;
    alarmCount++;
}