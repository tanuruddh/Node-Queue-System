FROM node:latest

COPY . /home/app

WORKDIR /home/app/

ENV CLOUD_AMQP_URL=amqps://rlugbzys:j8ROT4vYMpsShlQPDkrAsnneOlELqk73@shark.rmq.cloudamqp.com/rlugbzys
ENV PORT=3000

RUN npm install

EXPOSE 3000

CMD ["node","server"]