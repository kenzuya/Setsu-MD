echo "Updating system..."
sudo apt update
sudo apt upgrade -y
echo "Installing NodeJS..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
echo "Completed..."
npx --yes create-setsu-bot