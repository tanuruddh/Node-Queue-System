Backend System
This is a a backend system that efficiently manages requests from multiple users using a queue structure. Each client connected will have its queue where all requests will be processed sequentially. The system should be robust and scalable, ensuring that the queue is empty once all requests are processed and all users disconnect

Features
scale to handle an increasing number of users and requests without degradation in performance.
Implement error handling and recovery mechanisms to manage failures without data loss.

Clone the repository:
git clone https://github.com/tanuruddh/Node-Queue-System
Install dependencies for both project :
cd Queue-Consumers
npm install
Start the development server:
npm start

Again do the same for Queue-Sender
cd Queue-Sender
npm install
Start the development server:
npm start

Open your browser and go to http://localhost:5000 and http://localhost:4000 to use the app.

How to Use
First sign up with name , email , password, confirmPassword by post request on http://localhost:5000/api/v1/users/signup.
if have credential then login with email and password by post request on http://localhost:5000/api/v1/users/login .

after successfull autherization user will get jwt token in cookies or in response.
and a new queue added to the rabbitMQ for handling the reuest 
from sending get request on this http://localhost:5000/api/v1/tasks/two-tasks . user can add task 
