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

variable "user" {}
variable "resource_count" {}
variable "prefix" {}
variable "commands" {
  type="list"
}


# TODO: useful for distributed nodes
variable "regions" {
  type = "list"
  default = ["nyc1, sfo1"]
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

  connection {
    user = "${var.user}"
    type = "ssh"
    private_key = "${file(var.pvt_key)}"
    timeout = "2m"
  }


  provisioner "remote-exec" {
    inline = ["${var.commands}"]
  }

  provisioner "local-exec" {
    command ="echo '${self.name}:${self.ipv4_address}' >> server_data.txt"
  }
}
