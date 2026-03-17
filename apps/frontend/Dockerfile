FROM containerregistrycb.azurecr.io/golden-images:node-latest AS build-stage

ENV NODE_OPTIONS=--max_old_space_size=8192
ENV WORKSPACE_NAME=apps/frontend

WORKDIR /app
RUN mkdir -p /app/$WORKSPACE_NAME
COPY package*.json .
COPY $WORKSPACE_NAME/package*.json /app/$WORKSPACE_NAME

RUN npm install --workspaces=false
RUN npm install -w $WORKSPACE_NAME

COPY . /app/
RUN --mount=type=secret,id=doppler doppler run --token "$(cat /run/secrets/doppler)" \ 
    --command "NODE_ENV=development npx nx run zero-dash-frontend:build"

RUN npm prune --omit=dev -w $WORKSPACE_NAME

FROM containerregistrycb.azurecr.io/golden-images:nginx-latest

COPY --from=build-stage /app/apps/frontend/build /usr/share/nginx/html
COPY --from=build-stage /app/apps/frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD [ "nginx", "-g", "daemon off;" ]
