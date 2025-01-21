Microservices Project Payment

This project demonstrates a microservices architecture using Node.js and Nest.js, with Kafka as the messaging broker and REST APIs for communication. It implements two microservices:

Order Service: Manages orders and communicates with Kafka for event-driven functionality.
User Service: Handles user-related functionality and updates.

Project Structure

The project is structured as follows:
microservices-project-payment/
├── apps/
│   ├── order-service/
│   │   ├── prisma/                # Database schema and migrations
│   │   ├── src/
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── service/           # Business logic layer
│   │   │   ├── order-service.controller.ts
│   │   │   ├── order-service.module.ts
│   │   │   ├── main.ts            # Entry point for the service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.app.json
│   ├── user-service/
│       ├── prisma/                # Database schema and migrations
│       ├── src/
│       │   ├── dto/               # Data Transfer Objects
│       │   ├── service/           # Business logic layer
│       │   ├── user-service.controller.ts
│       │   ├── user-service.module.ts
│       │   ├── main.ts            # Entry point for the service
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.app.json
├── kafka-init.sh                  # Kafka topic initialization script
├── docker-compose.yml             # Docker Compose configuration for services
├── .gitignore
├── .gitattributes
├── README.md

To get started with the project:
Clone the repository using the following command:
git clone https://github.com/LaptiiDina/microservices-project-payment.git
Navigate to the project directory:
cd microservices-project-payment
Run the application using Docker Compose:
docker-compose up


API Endpoints

UserService:
Create User

URL: http://localhost:3002/users
Method: POST
Description: Creates a new user. The email field must be unique. If the email already exists, an error response is returned, and a message is sent to the dead-letter-events Kafka topic.
Request Body Example:
{
  "name": "John Doe",
  "email": "john.doe3@example.com"
}
/////////////////////////////////////////////////////

Get All Users
URL: http://localhost:3002/users
Method: GET
Description: Retrieves an array of all users.

/////////////////////////////////////////////////
Get User by ID
http://localhost:3002/users/:id
Method: GET
Description: Retrieves the details of a user by their unique ID. If the user ID does not exist, an error response is returned, and a message is sent to the dead-letter-events Kafka topic.
//////////////////////////////////////////////////


Order Service: 
//////////////////////
Create Order
http://localhost:3001/orders
Method: POST

Description: Creates a new order. The userId must correspond to an existing user. If the userId does not exist, an error response is returned, and a message is sent to the dead-letter-events Kafka topic.
After successfully creating an order, the totalOrders field of the user with the given userId is incremented by 1.
You can verify the changes in totalOrders by using http://localhost:3002/users/:id (GET method) to fetch a specific user or http://localhost:3002/users (GET method) to fetch all users.
Request Body Example:
{
  "userId": 3,
  "product": "qqqqqqqqqq",
  "quantity": 20
}

Note: To check existing userIds, you can use the http://localhost:3002/users endpoint (method GET) from the User Service.
/////////////////////////////

Get Order by ID
URL: http://localhost:3001/orders/:id
Method: GET
Description: Retrieves the details of an order by its id. If the specified order does not exist, an error response is returned, and a message is sent to the dead-letter-events Kafka topic.
///////////////////////////////////

Get All Orders
URL: http://localhost:3001/orders
Method: GET
Description: Retrieves an array of all existing orders.
//////////////////////////////////

Get All Orders by User ID
URL: http://localhost:3001/orders/user/:userId
Method: GET
Description: Retrieves an array of all orders associated with a specific userId.
If the userId does not exist, an error will be logged, and a message will be published to the Kafka dead-letter-events topic 
//////////////////////////////////////

Delete an Order by Order ID
URL: http://localhost:3001/orders/:id
Method: DELETE
Description: Deletes an order by its id. After deleting the order, the corresponding user's totalOrders count is decremented by 1.
You can verify the changes in totalOrders by using http://localhost:3002/users/:id (GET method) to fetch a specific user or http://localhost:3002/users (GET method) to fetch all users.
If the Id does not exist, an error will be logged, and a message will be published to the Kafka dead-letter-events topic 


Kafka:
How to Verify Kafka Events
To check the events being published to Kafka topics, follow these steps:
Open the Command Line: Access the command line interface where Docker is installed.
Find the Kafka Container ID: Run the following command to get the Kafka container's ID:

-docker ps

Access the Kafka Container: Use the container ID from the previous step to open an interactive shell inside the Kafka container:
Look for the container with the image name bitnami/kafka and note its CONTAINER ID.

-docker exec -it <container_id> bash

Consume Messages from a Topic: Inside the Kafka container, use the kafka-console-consumer.sh command to view messages from a specific topic. For example, to consume messages from the :

dead-letter-events topic:
-kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic dead-letter-events --from-beginning
order-placed:
-kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic order-placed --from-beginning
order-cancelled:
-kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic order-cancelled --from-beginning
user-created:
-kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-created --from-beginning


Topics to Monitor:

dead-letter-events:
Stores events that failed due to errors, such as:
Invalid event format (e.g., missing eventId or userId).
Failure to publish events to Kafka.
Issues in processing an event (e.g., user or order not found).
Helps debug issues related to unprocessable events.

order-placed:
Tracks successfully created orders.

order-cancelled:
Tracks successfully cancelled orders.

user-created:
Tracks successfully created users.




