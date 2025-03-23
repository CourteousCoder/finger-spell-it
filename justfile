defualt:
    echo 'Hello world'

bootstrap:
    echo 'This should idempotenty bootstrap the dev environment'
    echo 'If nix is not installed, then it should install it with 
    echo 'It should rely to direnv to enter the nix shell for us'


test:
    echo 'Running tests.'

build:
    echo 'Compiling.'

run:
    echo 'Run locally for development'

deploy:
    echo 'Deploy for production'
