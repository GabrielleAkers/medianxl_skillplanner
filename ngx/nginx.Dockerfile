FROM nginx

RUN rm -rf /etc/nginx/conf.d
RUN rm -rf /etc/nginx/templates
RUN mkdir -p /etc/nginx/templates
RUN mkdir -p /etc/nginx/conf.d
COPY ./templates/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80 443 ${PORT}