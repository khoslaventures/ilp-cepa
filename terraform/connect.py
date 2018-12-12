import operator
import json
import sys
import paramiko
import io
import os

from natsort import natsorted
from paramiko import SSHClient
from scp import SCPClient

dummy = "dummy.json"
curr_dir = os.getcwd()
repo_dir = "~/ilp-cepa/"
suffix = "addrsec.json"
server_key = "server" + suffix
input_key = "input" + suffix
prefix = "cepa"

def progress(filename, size, sent):
    sys.stdout.write("%s\'s progress: %.2f%%   \r" % (filename, float(sent)/float(size)*100) )

with open('server_data.txt') as f:
    lines = f.readlines()
    server_ips = [l.strip().split(":") for l in lines]
    sorted_ips = natsorted(server_ips, key=operator.itemgetter(0))
    print(sorted_ips)
    # For first server, send over dummy json, (can do it in here)
    # Retrieve {server_name}suffix from the server, via SCP. Store string data,
    # send it over to the next server via SCP. And so on
    ssh = SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.load_system_host_keys()
    counter = 0
    prevKey = None
    for server in sorted_ips:
        name = server[0]
        ip = server[1]
        ssh.connect(ip, username="root")
        print("Connected to", name, "with ip", server)
        scp = SCPClient(ssh.get_transport(), progress=progress)
        if name == "cepa0":
            fl = io.BytesIO()
            fl.write(b'test')
            fl.seek(0)
            print("Put dummy key")
            scp.putfo(fl, repo_dir + dummy)
        else:
            # Push the last server key
            prev_server_key = prefix + str(counter - 1) + suffix
            print("Put " + prev_server_key)
            scp.put(prev_server_key, input_key) # Catch exception
            ssh.exec_command("mv " + input_key + " " + repo_dir)

        # Pull the current server key
        curr_server_key = prefix + str(counter) + suffix
        print("Pull " + curr_server_key)
        scp.get(repo_dir + server_key)
        os.rename(server_key, curr_server_key)

        counter += 1

