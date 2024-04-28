FROM node:latest

COPY . /home/sender

WORKDIR /home/sender/

ENV CLOUD_AMQP_URL=amqps://rlugbzys:j8ROT4vYMpsShlQPDkrAsnneOlELqk73@shark.rmq.cloudamqp.com/rlugbzys
ENV PORT=5000

RUN npm install

EXPOSE 5000

CMD ["node","server"]