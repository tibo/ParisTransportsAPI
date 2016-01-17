# Paris Transport API

## Dev environment

- Install [Docker Toolbox](https://www.docker.com/docker-toolbox) 
- setup the docker machine : `docker-machine create --driver=virtualbox default` and update the docker environment : `eval "$(docker-machine env default)"`
- create the cluster : `docker-compose build`
- create the stations from seed : `docker-compose run --rm app grunt seed:metro`
- launch the cluster : `docker-compose run -d --rm --service-ports app`
- visit the web app : `open "http://".$(docker-machine ip default).":3000"`