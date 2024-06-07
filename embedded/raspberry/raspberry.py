import time
import RPi.GPIO as GPIO
from lib_nrf24 import NRF24
import spidev
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score
import pymongo

client = pymongo.MongoClient(  "mongodb+srv://<username>:<password>@general.bwntdog.mongodb.net/?retryWrites=true&w=majority&appName=general")
db = client["test"]
collection = db["bins"]

id = 2

new_value = {"is_full": 0}

collection.update_one({"id": id}, {"$set": new_value})

updated_data = collection.find_one({"id": id})

data = {
    'x1': [14, 12, 13, 10, 5,  13, 5,  11, 8,  11, 10, 11, 5,  5,  8,  12, 10, 12, 4,  1],
    'x2': [14, 12, 13, 9,  7,  8,  11, 8,  9,  14, 9,  12, 5,  6,  8,  13, 10, 13, 4,  1],
    'x3': [15, 11, 14, 8,  5,  7,  13, 9,  9,  14, 12, 11, 7,  6,  5,  11, 11, 12, 5,  1],
    'x4': [23, 20, 22, 18, 10, 11, 21, 13, 7,  22, 10, 16, 7,  6,  7,  17, 12, 20, 5,  1],
    'x5': [23, 20, 21, 16, 17, 10, 20, 7,  9,  21, 9,  15, 7,  6,  8,  17, 11, 20, 5,  1],
    'x6': [20, 17, 18, 14, 15, 8,  18, 10, 17, 19, 6,  13, 5,  5,  9,  14, 8,  17, 4,  1],
    'x7': [20, 15, 17, 12, 15, 6,  18, 6,  19, 19, 6,  14, 6,  4,  14, 15, 9,  14, 4,  1],
    'y':  [0,  27, 16, 38, 51, 59, 10, 64, 70, 6,  82, 44, 94, 96, 79, 41, 56, 20, 98, 100]
}

data_set = pd.DataFrame(data)

X = data_set[['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7']]
y = data_set['y']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train.values)
X_test_scaled = scaler.transform(X_test.values)

linear_reg_model = LinearRegression()
linear_reg_model.fit(X_train_scaled, y_train)
print(linear_reg_model.coef_.round(2))
print(linear_reg_model.intercept_.round(2))

y_pred = linear_reg_model.predict(X_test_scaled)

mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Ortalama Karesel Hata (MSE): {mse}")
print(f"R-kare Değeri: {r2}")

GPIO.setmode(GPIO.BCM)

pipes = [[0xE8, 0xE8, 0xF0, 0xF0, 0xE1], [0xF0, 0xF0, 0xF0, 0xF0, 0xE1]]

radio = NRF24(GPIO, spidev.SpiDev())
radio.begin(0, 17)

radio.setPayloadSize(32)
radio.setChannel(0x76)
radio.setDataRate(NRF24.BR_1MBPS)
radio.setPALevel(NRF24.PA_MIN)

radio.setAutoAck(True)
radio.enableDynamicPayloads()
radio.enableAckPayload()

radio.openReadingPipe(1, pipes[1])
radio.printDetails()
radio.startListening()
arr=[]
first_counter=0
second_counter=0

while True:
	if first_counter < 7:    
		while not radio.available(0):
			time.sleep(1/100)
		receivedMessage = []
		radio.read(receivedMessage, radio.getDynamicPayloadSize())
		arr.append(receivedMessage[0])
		#print("Received: {}".format(receivedMessage[0]))
		first_counter +=1
		if first_counter == 7:
			manuel_input = np.array(arr).reshape(1, -1)  # Örneğin, elle girilen ölçüm değerleri
			manuel_input_scaled = scaler.transform(manuel_input)
			predict = linear_reg_model.predict(manuel_input_scaled)
			predict_limited = np.clip(predict, 0, 100)
			fullness_predict = int(predict_limited[0])
			print("*")
			print(fullness_predict)
			if(fullness_predict<50):
				new_value = {"is_full": 0}
				collection.update_one({"id": id}, {"$set": new_value})
			else:
				new_value = {"is_full": 1}
				collection.update_one({"id": id}, {"$set": new_value})				

	else:
		first_counter = 0
		second_counter = 0
		arr= []