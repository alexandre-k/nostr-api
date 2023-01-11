FROM golang:latest

RUN mkdir /app
WORKDIR /app

EXPOSE 8080

COPY ./server/* .
COPY ./client/build/* ./client/build/

RUN curl -fLo install.sh https://raw.githubusercontent.com/cosmtrek/air/master/install.sh \
    && chmod +x install.sh && sh install.sh && cp ./bin/air /bin/air

RUN go mod download

CMD air
