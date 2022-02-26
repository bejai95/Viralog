# Web Scraper
Please run `npm install` to install dependencies.
### Start Serverless Function Locally
```
DB_USER="..." DB_PASS="..." DB_NAME="..." DB_HOST="..." npm start
```
*Please ask for the secret values. These are not committed for security.*

### Trigger a Scrape
```
npm run scrape
```

or
```
curl localhost:8080 \
  -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 123451234512345" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2020-01-02T12:34:56.789Z" \
  -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
  -H "ce-source: //pubsub.googleapis.com/projects/seng3011-qq-342402/topics/scrape" \
  -d '{
        "message": "local",
        "subscription": "projects/seng3011-qq-342402/subscriptions/gcf-scrape-us-central1-scrape"
      }'
```
or
```
curl localhost:8080 -X POST -H "Content-Type: application/json" -H "ce-id: 123451234512345" -H "ce-specversion: 1.0" -H "ce-time: 2020-01-02T12:34:56.789Z" -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" -H "ce-source: //pubsub.googleapis.com/projects/seng3011-qq-342402/topics/scrape" -d '{ "message": "local", "subscription": "projects/seng3011-qq-342402/subscriptions/gcf-scrape-us-central1-scrape" }'
```
