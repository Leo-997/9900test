FROM containerregistrycb.azurecr.io/golden-images:node-latest

ENV WORKSPACE_NAME=apps/api

WORKDIR /app
RUN mkdir -p /app/$WORKSPACE_NAME
COPY package*.json .
COPY $WORKSPACE_NAME/package*.json /app/$WORKSPACE_NAME

# install the backend api 
RUN npm install --workspaces=false
RUN npm install -w $WORKSPACE_NAME
COPY . /app/
RUN npx nx run zero-dash-api:build --parallel=1

# install db SSL cert
RUN mkdir /run/secrets
RUN --mount=type=secret,id=db_cert \
    --mount=type=secret,id=db_cert_name \
    cat /run/secrets/db_cert | base64 -d >> "/run/secrets/$(cat /run/secrets/db_cert_name)"

RUN --mount=type=secret,id=db_cert_name chmod 400 "/run/secrets/$(cat /run/secrets/db_cert_name)"

EXPOSE 3001

CMD doppler run -- npm run start -w $WORKSPACE_NAME
