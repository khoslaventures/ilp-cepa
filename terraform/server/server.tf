variable "user" {
  default = "root"
}

resource "digitalocean_droplet" "end" {
  image = "ubuntu-18-04-x64"
  name = "end"
  region = "nyc1"
  size = "512mb"
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
    inline = [
      "export PATH=$PATH:/usr/bin",
      "sudo apt-get update",
      "sudo apt -qq install -y nodejs npm",
      # Install and run moneyd
      "npm install -g moneyd moneyd-uplink-xrp --silent", # remove silent if bugs
      "moneyd xrp:configure --testnet",
      "screen -S moneyd -dm moneyd xrp:start --testnet", # May need to wait?
      "git clone https://github.com/khoslaventures/ilp-cepa.git",
      "cd ilp-cepa",
      "npm "
    ]
  }

  provisioner "local-exec" {
    command ="scp -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 ${var.user}@${digitalocean_droplet.end.ipv4_address}:~/ilp-cepa/package.json ${digitalocean_droplet.end.name}.json"
  }
}
