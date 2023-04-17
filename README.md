# Ormos

Archivist for MTG cards, assistant to store owners everywhere

## Docker Setup
                                                         
### Requirements
                                                         
You will need `docker desktop` installed.
                                                         
### Starting

To run the project, you will need the latest copy of `AllPrintings.sqlite` from [MTG JSON](https://mtgjson.com/downloads/all-files/) in the `data` folder. This can be retrieved manually or via the following command:

```sh
npm run fetch:allPrintings
```

To run the environment hosted on docker, run the following:

```
docker-compose build
docker-compose up
```

