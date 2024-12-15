import React, { useState, useEffect } from "react";
import { ethers, BrowserProvider } from "ethers";
import TravelIdentityABI from "./TravelIdentityABI.json";
import './App.css';
import './index.css';

const contractAddress = "0x142Ee563A1048e7D4767D8885B01E6f58f49dc4B"; // Your deployed contract address

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadEthereum() {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask to use this DApp.");
          return;
        }

        const provider = new BrowserProvider(window.ethereum); 
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(
          contractAddress,
          TravelIdentityABI,
          signer
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Failed to connect to Ethereum:", error);
        alert("Failed to connect to Ethereum.");
      }
    }

    loadEthereum();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Username cannot be empty.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format.";
    if (!documentHash || documentHash.length < 8) newErrors.documentHash = "Hash ID must be at least 8 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerUser = async () => {
    if (!validateForm()) return;
    try {
      const tx = await contract.registerUser(name, email, documentHash);
      await tx.wait();
      alert("User registered successfully!");
    } catch (error) {
      console.error(error);
      alert("Registration failed.");
    }
  };

  const getUserDetails = async () => {
    try {
      const user = await contract.getUser(account);
      setUserDetails(user);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch user details.");
    }
  };

  return (
    <div className="app-container">
      <div id="particles-js"></div>
      <div className="container">
        <h1>Welcome to <span className="brand">Let's Book It</span></h1>
        <p>Your one-stop destination for booking travel, hotels, and cabs—easy, quick, and seamless!</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="hashId">Hash ID</label>
            <input
              type="text"
              id="hashId"
              value={documentHash}
              onChange={(e) => setDocumentHash(e.target.value)}
              placeholder="Enter your hash ID"
            />
            {errors.documentHash && <div className="error">{errors.documentHash}</div>}
          </div>

          <button type="submit" onClick={registerUser}>Verify</button>
        </form>
        <br></br>

        <button  type="user_detail" onClick={getUserDetails}>Get User Details</button>

        {userDetails && (
          <div className="user-details">
            <h3>User Details:</h3>
            <p>Name: {userDetails.name}</p>
            <p>Email: {userDetails.email}</p>
            <p>Verified: {userDetails.isVerified ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;