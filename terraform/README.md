# Terraform Scripts for ILP-Cepa

```
brew install terraform
```

Set `$HOME/.do_token` to contain:
```
DO_PAT=<Insert DigitalOcean API Key>
SSH_FINGERPRINT=<Insert SSH FIngerprint for keypair>
```

Use `make apply` to run the DigitalOcean instances.
Use `make destroy` to destroy the DigitalOcean instances.
Use `make validate` to validate the Terraform file.
