# Setup
## Creating the user account and disabling password authentication
1. Create two ssh keys, one for root access and one for the service worker account
    ```sh
    ssh-keygen -t rsa -b 4096 -C "root@<your-server-ip>" -q -N "" -f "/home/<your-username>/.ssh/<your-server-name>-root_id_rsa"
    ssh-keygen -t rsa -b 4096 -C "worker@<your-server-ip>" -q -N "" -f "/home/<your-username>/.ssh/<your-server-name>-worker_id_rsa"
    ```

2. Spin up a new instance, ubuntu preferred, and set the root user public key which you can get with
    ```sh
    cat ~/.ssh/<your-server-name>-root_id_rsa.pub
    ```

2. First print the worker's public key
    ```sh
    cat ~/.ssh/<your-server-name>-worker_id_rsa.pub
    ```

    Copy it and ssh into root
    ```sh
    ssh root@<your-server-ip> -i ~/.ssh/<your-server-name>-root_id_rsa
    ```

    Create the new worker user and give them a .ssh directory
    ```sh
    useradd -d /home/worker -s /bin/bash worker && mkdir -p /home/worker/.ssh && chown -R worker:worker /home/worker
    ```

    Now edit their authorized_keys file to enable public key authentication
    ```sh
    vi /home/worker/.ssh/authorized_keys
    ```

    Paste the contents of the public key you copied previously with `ctrl+shift+v` then hit `ctrl+c` and type `:wq` and hit enter to save and exit vim.

3. Now edit the sshd_config to prevent password authentication for security
    ```sh
    vi /etc/ssh/sshd_config
    ```

    Find the line that says `# PasswordAuthentication yes` and hit `i` to enter edit mode and remove the leading "#" to uncomment the line and change "yes" to "no".
    Also find the line that says `# PubkeyAuthentication yes` and make sure its uncommented and set to "yes." 
    
    Save and exit vim then restart the ssh service with
    ```sh
    systemctl restart ssh
    ```

4. Exit the root ssh shell by running
    ```sh
    exit
    ```

    You should be back on your local machine; to make sure everything was set up correctly try to ssh into the worker account with
    ```sh
    ssh worker@<your-server-ip> -i ~/.ssh/<your-server-name>-worker_id_rsa
    ```

    You should be able to connect. Exit the shell and try again with
    ```sh
    ssh worker@<your-server-ip>
    ```

    This should fail with a message like this
    ```sh
    worker@<your-server-ip>: Permission denied (publickey).
    ```

    If you see that then everything is set up correctly and you can continue otherwise go back and make sure you followed all the steps correctly.

## Installing and preparing docker (see: https://docs.docker.com/engine/install/ubuntu/)
1. Ssh into your server as root
    ```sh
    ssh root@<your-server-ip> -i ~/.ssh/<your-server-name>-root_id_rsa
    ```

2. Uninstall all conflicting packages that may already be installed (they may not)
    ```sh
    for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt remove $pkg; done
    ```

3. Install some prequesites that allow docker to run rootless
    ```
    apt update
    apt install uidmap dbus-user-session systemd-container -y
    ```

4. Add Docker's apt repository
    ```sh
    # GPG key
    apt update
    apt install ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

    # add apt source
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    ```

5. Install Docker
    ```
    apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras -y
    ```

6. Setup docker daemon for the worker
    ```
    machinectl shell worker@
    dockerd-rootless-setuptool.sh install
    vi ~/.bash_profile
    ```

    Paste in these lines then save and quit vim
    ```
    export PATH=/usr/bin:$PATH
    export DOCKER_HOST=unix:///run/user/1000/docker.sock
    ```
    Run the following to exit the worker login and enable docker to start on system startup

    ```
    exit
    loginctl enable-linger worker
    exit
    ```

7. You should be back on your computer at this point so its time to test that everything was done correctly
    ```
    ssh worker@<your-server-ip> -i ~/.ssh/<your-server-name>-worker_id_rsa
    docker run hello-world
    ```

    You should see something like this
    ```
    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    e6590344b1a5: Pull complete 
    Digest: sha256:0b6a027b5cf322f09f6706c754e086a232ec1ddba835c8a15c6cb74ef0d43c29
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    This message shows that your installation appears to be working correctly.

    To generate this message, Docker took the following steps:
    1. The Docker client contacted the Docker daemon.
    2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
        (amd64)
    3. The Docker daemon created a new container from that image which runs the
        executable that produces the output you are currently reading.
    4. The Docker daemon streamed that output to the Docker client, which sent it
        to your terminal.

    To try something more ambitious, you can run an Ubuntu container with:
    $ docker run -it ubuntu bash

    Share images, automate workflows, and more with a free Docker ID:
    https://hub.docker.com/

    For more examples and ideas, visit:
    https://docs.docker.com/get-started/

    ```
    
    If not then double check you followed all the steps and refer to [the docs](https://docs.docker.com/engine/security/rootless) for additional help.

#### At this point everything else can be done through the app and you're good to go :)