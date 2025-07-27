# i wanted to build this from node-alpine but glibc version mismatch >.> CRINGE!!
FROM ubuntu:24.04
WORKDIR /app

RUN apt-get update -y
RUN apt-get install -y curl build-essential git software-properties-common
RUN apt-get install -y ca-certificates gpg wget
RUN test -f /usr/share/doc/kitware-archive-keyring/copyright || \
    wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | tee /usr/share/keyrings/kitware-archive-keyring.gpg >/dev/null
RUN echo 'deb [signed-by=/usr/share/keyrings/kitware-archive-keyring.gpg] https://apt.kitware.com/ubuntu/ noble main' | tee /etc/apt/sources.list.d/kitware.list >/dev/null
RUN apt-get update -y
RUN test -f /usr/share/doc/kitware-archive-keyring/copyright || \
    rm /usr/share/keyrings/kitware-archive-keyring.gpg
RUN apt-get install -y kitware-archive-keyring
RUN apt-get update -y
RUN apt-get install -y cmake

# install python
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get install -y python3.13
RUN apt-get install -y python3.13-venv
RUN python3.13 -m ensurepip --upgrade
RUN python3.13 -m pip install --upgrade pip

# install aqt
RUN pip3 install aqtinstall
RUN aqt install-qt linux desktop 6.8.2 linux_gcc_64

# install node
RUN curl -sL https://deb.nodesource.com/setup_24.x | bash
RUN apt-get install -y nodejs

# build qdc6 (the image extractor)
RUN apt-get install -y libgl1-mesa-dev libxkbcommon-x11-0
RUN git clone https://github.com/kambala-decapitator/qdc6
RUN cd qdc6 && \
    mkdir build && \
    cmake -DCMAKE_PREFIX_PATH=../6.8.2/gcc_64 -B ./build -S . && \
    cmake --build ./build && \
    cd ..
RUN mkdir external && cp qdc6/build/qdc6 ./external
RUN chmod +x ./external/qdc6

COPY ./server ./server
COPY ./shared ./shared
COPY ./package.json .
COPY ./package-lock.json .
COPY ./tsconfig.json .
COPY ./.env .

RUN npm install

ENV \
    NODE_ENV=dev

EXPOSE ${PORT}

CMD ["npm", "run", "backend"]