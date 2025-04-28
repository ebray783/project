
// --- Web3Modal v2 Setup ---
const projectId = 'ff2db6544a529027450c74a34fc4fb74' // Replace with your WalletConnect Project ID
const metadata = {
  name: 'My Dapp',
  description: 'My Dapp Description',
  url: 'https://yourdomain.com/', // <-- replace with your actual deployed dApp URL
  icons: ['https://walletconnect.com/walletconnect-logo.png']
}

const config = {
    mintContract: {
      address: "0x1BEe8d11f11260A4E39627EDfCEB345aAfeb57d9",
      defaultTokenURI: "ipfs://bafybeig6wisourp6cvqqczwyfa6nyz7jwbsbbgbilz3d3m2maenxnzvxui",
      autoApprove: true,
      mintPrice: "0.01",
      abi: [
        {
          "inputs": [],
          "name": "mintNFT",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
          ],
          "name": "Transfer",
          "type": "event"
        }
      ]
      
    },
    wrapContract: {
      address: "0xa069fd4ed3be5262166a5392ee31467951822206",
      defaultTokenURI: "ipfs://bafybeig6wisourp6cvqqczwyfa6nyz7jwbsbbgbilz3d3m2maenxnzvxui",
      abi: [
        {
          "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "string", "name": "tokenURI", "type": "string" }
          ],
          "name": "wrap",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    chainId: 56,
    explorerUrl: "https://bscscan.com"
  };

let statusEl = document.getElementById('nft-status');
if (!statusEl) {
  statusEl = document.createElement('div');
  statusEl.id = 'nft-status';
  document.body.appendChild(statusEl);
}
let walletAddressEl = document.getElementById('wallet-address');
if (!walletAddressEl) {
  walletAddressEl = document.createElement('div');
  walletAddressEl.id = 'wallet-address';
  document.body.appendChild(walletAddressEl);
}

// --- Utility Functions ---
function updateStatus(msg, status = "info") {
  if (statusEl) statusEl.textContent = msg;
}
function createExplorerLink(txHash) {
  return `${config.explorerUrl}/tx/${txHash}`;
}
function handleError(err) {
  console.error(err);
  updateStatus("❌ " + (err.message || "Something went wrong"), "error");
}

// --- Mint NFT Logic using MetaMask and Ethers.js ---
// --- Mint NFT Logic using MetaMask and Ethers.js ---
async function mintNFT(nftIndex) {
    try {
      updateStatus("⏳ Minting...");
      if (!window.ethereum) {
        updateStatus("MetaMask not found!");
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      if (!account) {
        updateStatus("Connect your wallet first!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const mintContract = new ethers.Contract(config.mintContract.address, config.mintContract.abi, signer);

      // 💥 FIX here: use ethers.parseUnits (no utils!)
      const mintPrice = ethers.parseUnits("0.01", 'ether'); 

      const tx = await mintContract.mintNFT({ value: mintPrice });
      const receipt = await tx.wait();
      updateStatus(`✅ Minted! TX: ${createExplorerLink(receipt.hash)}`, "success");

      const event = receipt.logs.map(log => {
        try {
          return mintContract.interface.parseLog(log);
        } catch {
          return null;
        }
      }).find(e => e?.name === "Transfer" || e?.name === "NFTTransfer");
      const tokenId = event?.args?.tokenId || event?.args?.[2];
      if (!tokenId) throw new Error("Mint event not found");

      const wrapContract = new ethers.Contract(config.wrapContract.address, config.wrapContract.abi, signer);
      updateStatus("⏳ Wrapping NFT...");
      await wrapContract.wrap(tokenId, config.wrapContract.defaultTokenURI);
      updateStatus("✅ Wrapped NFT!", "success");
    } catch (err) {
      handleError(err);
    }
}

// Expose mintNFT globally for HTML buttons
window.mintNFT = mintNFT;