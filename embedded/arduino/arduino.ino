#include<SPI.h>
#include<RF24.h>
#include <Servo.h>

RF24 radio (9, 10);

Servo servo_1;

int TrigPin = 4, EchoPin = 5;

int sure, mesafe;

void setup (void)
{
  Serial.begin (9600);
    
  servo_1.attach (3);
  radio.begin ();
    
  radio.setPALevel (RF24_PA_MAX);
    
  radio.setChannel (0x76);
    
  radio.openWritingPipe (0xF0F0F0F0E1LL);
    
  radio.enableDynamicPayloads ();
    
  radio.powerUp ();
    
  pinMode (TrigPin, OUTPUT);
    
  pinMode (EchoPin, INPUT);
} 

void loop (void)
{
  delay (100);
    
  for (int i = 0; i < 7; i++) {
    servo_1.write (i * 15);        
    digitalWrite (TrigPin, LOW);
    delayMicroseconds (2);
    digitalWrite (TrigPin, HIGH);
    delayMicroseconds (10);
    digitalWrite (TrigPin, LOW);

    sure = pulseIn (EchoPin, HIGH);
    mesafe = sure / 29.1 / 2;
    Serial.println (mesafe);
        
    bool success = radio.write (&mesafe, sizeof (mesafe));
        
    if (success) {
      Serial.println ("Veri gC6nderildi.");  
    }
    else {
      Serial.println ("Veri gC6nderilemedi.");  
    }
    
    delay (500);
  }
    
  servo_1.write (0);
  
  delay (10000);
}
