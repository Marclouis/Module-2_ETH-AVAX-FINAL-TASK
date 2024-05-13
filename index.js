import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && amount > 0) {
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm && amount > 0) {
      let tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <div className="flex justify-center text-sm font-thin mt-6">
        <button className="hover:bg-lime-700 bg-lime-900 duration-300 ease-in-out p-4 rounded text-white" onClick={connectAccount}>
          Please connect your Metamask wallet 
        </button>
        </div>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <div className="text-sm font-thin mt-7 ml-5 ">
        <hr />
          <p>Your Account: {account}</p>
          <hr />
          <p>Your Balance: {balance}</p>
          <hr/>
        </div>
        <div className="flex justify-center mt-3">
          <input className="outline-green-700  shadow-inner" type="text" placeholder="Input Amount..." value={amount} onChange={(e)=>{
            const x = e.target.value 
            setAmount(x >= 0 ? x : 0)

          }} />
        </div>
        <div className="flex justify-center gap-5 mt-8 text-white">
          <button className="border bg-blue-700/60 p-1 px-4 rounded-xl hover:bg-blue-700 duration-300 ease-in-out disabled:cursor-not-allowed disabled:bg-slate-500 " disabled={amount <= 0} onClick={deposit}>Deposit  ETH</button>
          <button className="border bg-blue-700/60 p-1 px-4 rounded-xl hover:bg-blue-700 duration-300 ease-in-out disabled:cursor-not-allowed disabled:bg-slate-500 " disabled={amount <= 0} onClick={withdraw}>Withdraw  ETH</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="flex justify-center bg-black/80">
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="h-screen flex items-center justify-center">
        <div className="bg-white w-[400px] h-[250px] rounded shadow-xl ">
          <header className="flex justify-center mt-5">
            <h1 className="font-semibold text-lime-700">
              Welcome to the Metacrafters ATM!
            </h1>
          </header>

          {initUser()}
        </div>
      </div>
    </main>
  );
}
