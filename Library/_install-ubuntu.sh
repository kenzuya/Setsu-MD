echo "Updating system..."
sudo apt update
sudo apt upgrade -y
echo "Completed..."
echo "Installing git..."
sudo apt install -y git
echo "Completed..."
echo "Installing ffmpeg..."
sudo apt install -y ffmpeg
echo "Completed..."
echo "Installing curl..."
sudo apt install -y curl
echo "Completed..."
echo "Installing NodeJS..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
echo "Completed..."
echo "Cloning Repository..."
git clone https://github.com/Kenzuya/Setsu-MD.git
echo "Completed..."
echo "Installing Dependencies..."
cd Setsu-MD
npm install
npm install -g pm2
npm install -g ts-node
echo "Completed..."
echo "Starting Bot..."
npm start