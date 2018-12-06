SSH_FINGERPRINT="31:54:98:be:52:2a:12:bf:51:ad:86:a3:8e:44:a8:fd"

terraform plan \
  -var "do_token=${DO_PAT}" \
  -var "pub_key=$HOME/.ssh/id_rsa.pub" \
  -var "pvt_key=$HOME/.ssh/id_rsa" \
  -var "ssh_fingerprint=$SSH_FINGERPRINT"

read -p "Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  terraform apply \
    -var "do_token=${DO_PAT}" \
    -var "pub_key=$HOME/.ssh/id_rsa.pub" \
    -var "pvt_key=$HOME/.ssh/id_rsa" \
    -var "ssh_fingerprint=$SSH_FINGERPRINT"
else
  echo "Cancelled.";
fi

