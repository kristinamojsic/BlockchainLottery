import React, { useState, useEffect } from "react";
//import { ethers } from 'ethers';
import ABI from './lotteryABI.json';
const ethers = require("ethers");

const contractAddress = "0xC25B33904bf81052CDf829497d7CeB0e9A764CDB";

function Home() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [contractInstance, setContractInstance] = useState(null);
    const [status, setStatus] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [winner, setWinner] = useState('');
    const [isClaimed, setIsClaimed] = useState(false);
    const [owner,setOwner] = useState('');
    const [isOwnerConnected, setIsOwnerConnected] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.BrowserProvider(window.ethereum);
                try {
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    setCurrentAccount(address);
                    window.ethereum.on('accountsChanged', (accounts) => {
                        setCurrentAccount(accounts[0]);
                    });
                    const contractIns = new ethers.Contract(contractAddress, ABI, signer);
                    setContractInstance(contractIns);
                    const owner = await contractIns.getOwner();
                    setOwner(owner);
                    setIsOwnerConnected(owner === currentAccount);
                    const status = await contractIns.isComplete();
                    setStatus(status);
                    const winner = await contractIns.getWinner();
                    setWinner(winner);
                    setIsWinner(winner === currentAccount);
                    const claimed = await contractIns.isClaimed();
                    setIsClaimed(claimed);
        
                    contractIns.on("LotteryEntered",(buyer,amount)=>
                    {
                        alert("You've entered the lottery");
                    })
                    } catch (err) {
                    console.error(err);
                }
            } else {
                alert('Please install Metamask to use this application');
            }
        };
    
        const handlePrizeClaimed = (claimer) => {
            if (claimer === currentAccount) {
                setIsClaimed(true);
            }
        };
    
        if (contractInstance) {
            contractInstance.on("PrizeClaimed", handlePrizeClaimed);
        }
    
        loadBlockchainData();
        
        return () => {
            if (contractInstance) {
                contractInstance.removeAllListeners();
                contractInstance.off("PrizeClaimed", handlePrizeClaimed);
            }
        };
    }, [currentAccount]);
    

    const enterLottery = async () => {
        try{
            const amountToSend = ethers.parseEther('0.001');
            const tx = await contractInstance.enter({ value: amountToSend });
            await tx.wait();
        }
        catch(error){
            alert("Insufficient funds");
        }  
    };

    const pickWinner = async () => {
        try{
            const tx = await contractInstance.pickWinner();
            await tx.wait();
        }
        catch(error){
            alert(error.reason);
        }
        
    };
    
    const claimPrize = async () => {
        const tx = await contractInstance.claimPrize();
        await tx.wait();};
    
    return (
        

        
        <div className="container">
            {!status && !isOwnerConnected &&
            <div className="welcome-container">
            <div className="welcome-content">
                <p className="exciting-text">Welcome to our exciting lottery experience!</p>
                <p className="dreams-come-true">Feeling lucky today? Purchase your chance to win big!</p>
                <p className="entry-fee">Embrace destiny: Entry fee - Only 0.01ETH per ticket</p>
                <p className="good-luck">Good luck!</p>
            </div>
            </div>
}
{status && !isOwnerConnected &&
            <div className="welcome-container">
            <div className="welcome-content">
                <p className="exciting-text">Lottery has ended. </p>
                <p className="dreams-come-true">Thank you for participating!</p>
                
            </div>
            </div>
}

<div className="button-container">
    {!status && isOwnerConnected && (
        <button className="enter-button" onClick={pickWinner}>
            Pick Winner
        </button>
    )}
    
    {!status && !isOwnerConnected && (
        <div>
            <button className="enter-button" onClick={enterLottery}>Enter Lottery</button>
        </div>
    )}
    {status && (
        isWinner ? (
            isClaimed ? (
                <p className="notowner"> You've already claimed the prize </p>
            ) : (
                <>
                    <p className="notowner">Congratulations! You won the lottery</p>
                    {!isClaimed && (
                        <button className="claim-button" onClick={claimPrize}>Claim Prize</button>
                    )}
                </>
            )
        ) : (
            <p className="notowner">
                {isOwnerConnected ? `Lottery Winner is: ${winner}` : "We are sorry, you are not the winner"}
            </p>
        )
    )}
</div>

        </div>
        
    );
}

export default Home;
