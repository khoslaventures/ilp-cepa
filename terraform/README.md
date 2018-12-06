# Terraform Scripts for ILP-Cepa

```
brew install terraform
```

Set `$HOME/.do_token` to contain:
```
DO_PAT=<Insert DigitalOcean API Key>
SSH_FINGERPRINT=<Insert SSH FIngerprint for keypair>
```

Change the `.sh` files to work with your own keys.

Use `./terraform.sh` to run the DigitalOcean instances.
Use `./destroy.sh` to destroy the DigitalOcean instances.


