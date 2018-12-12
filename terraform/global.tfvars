user = "root"
resource_count = "3"
prefix = "cepa"
commands = [
      "export PATH=$PATH:/usr/bin",
      "sudo apt -qq update",
      "sudo apt -qq install -y nodejs npm tmux",
      # Install and run moneyd
      "npm install -gs moneyd moneyd-uplink-xrp", # remove silent if bugs
      "moneyd xrp:configure --testnet",
      "screen -S moneyd -dm moneyd xrp:start --testnet",
      "git clone -b akash/tf https://github.com/khoslaventures/ilp-cepa.git",
      "cd ilp-cepa",
      "npm install -s",
      "tmux start-server",
      "tmux new-session -d -s session",
      "tmux new-window -t session:1",
      "tmux send-keys -t session:1 node Space run-server.js C-m"
    ]