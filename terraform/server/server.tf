# Suppose I have a topology like such:

# Client -> CEPA2 -> CEPA1 -> CEPA0

# Terraform sets up CEPA1. CEPA1 generates shared secret and address, outputs it to file.
# Terraform SCPs the shared secret and address to local, calls it cepa1addsec.json

# Terraform sets up CEPA2, by importing the cepa2addsec.json onto the server.
# CEPA2 generates shared secret and address, outputs it to file. Terraform
# SCPs the shared secret and address to local, calls it cepa2addsec.json.

# Terraform sets up CEPA3, by importing the cepa2addsec.json onto the server,
# CEPA3 generates shared secret and address, outputs it to file. Terraform
# SCPs the shared secret and address to local, calls it cepa3addsec.json.

# Client imports cepa*addsec.json onto their server. Client is designed to read
# through all of these, and has a function that will handle the JSONs and a
# constructor that takes an arbitrary number of secret/address pairs. Client handles in
# descending order

# TODO: Parameterize more things
variable "user" {
  default = "root"
}

# TODO: useful for distributed nodes
variable "regions" {
  type = "list"
  default = ["nyc1, sfo1"]
}

variable "prefix" {
  default = "cepa"
}
variable "resource_count" {
  default = 3
}

resource "digitalocean_droplet" "servers" {
  count = "${var.resource_count}" # always incrementing, starting from 1
  image = "ubuntu-18-04-x64"
  name = "${var.prefix}${count.index}"
  region = "nyc1"
  size = "1GB"
  private_networking = true
  ssh_keys = [
    "${var.ssh_fingerprint}"
  ]

#  Could have client async wait for files to be produced, and then run the stuff.
#  Should ignore/send dummy file when ${count.index} is 0
  provisioner "file" {
    source      = "${count.index != 0 ? "${var.prefix}${count.index - 1}addrsec.json" : "dummy.json"}"
    destination = "${count.index != 0 ? "/root/inputaddrsecret.json" : "/root/dummy.json"}"
  }

  connection {
    user = "${var.user}"
    type = "ssh"
    private_key = "${file(var.pvt_key)}"
    timeout = "2m"
  }

  provisioner "remote-exec" {
    inline = [
      "export PATH=$PATH:/usr/bin",
      "sudo apt -qq update",
      "sudo apt -qq install -y nodejs npm",
      # Install and run moneyd
      "npm install -g moneyd moneyd-uplink-xrp --silent", # remove silent if bugs
      "moneyd xrp:configure --testnet",
      "screen -S moneyd -dm moneyd xrp:start --testnet",
      "git clone -b akash/tf https://github.com/khoslaventures/ilp-cepa.git",
      "cd ilp-cepa",
      "npm install --silent",
      "[ -f /root/inputaddrsecret.json ] && mv /root/inputaddrsecret.json .", // check if file exists and then move.
      "node run-server.js"
    ]
  }

  provisioner "local-exec" {
    command ="scp -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 ${var.user}@${digitalocean_droplet.servers.ipv4_address}:~/ilp-cepa/serveraddrsec.json ${digitalocean_droplet.servers.name}addrsec.json"
  }
}
