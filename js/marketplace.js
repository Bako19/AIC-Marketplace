"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;
let isEligibleForOG = false;
let isEligibleForPR = false;

let contractAddress = "0x1FdBAaF5A73c308A3D66F620201983A28b49d7f6";
let mainContractAddress = "0xB78f1A96F6359Ef871f594Acb26900e02bFc8D00";
let abi = [{
        "inputs": [{
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }, {
            "internalType": "address",
            "name": "operator",
            "type": "address"
        }],
        "name": "isApprovedForAll",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{
            "internalType": "address",
            "name": "operator",
            "type": "address"
        }, {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
        }],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{
            "internalType": "uint256[]",
            "name": "tokenIds",
            "type": "uint256[]"
        }],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [{
            "internalType": "uint256[]",
            "name": "tokenIds",
            "type": "uint256[]"
        }],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [{
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        }],
        "name": "checkStakeTierOfToken",
        "outputs": [{
                "internalType": "uint256",
                "name": "tierId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "stakeDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "passedTime",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentSeasonStartTime",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "name": "stakedTokens",
        "outputs": [{
                "internalType": "uint256",
                "name": "stakeDate",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "stakerAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }],
        "name": "tokensStakedBy",
        "outputs": [{
            "internalType": "bool[]",
            "name": "",
            "type": "bool[]"
        }],
        "stateMutability": "view",
        "type": "function"
    }
]



async function init() {
    const providerOptions = {};
    web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
        disableInjectedProvider: false,
    });
    try {
        if (window.ethereum.selectedAddress !== null) {
            connect();
        }
    } catch (error) {

    }


}
async function fetchAccountData() {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];
}

async function onConnect() {
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    provider.on("accountsChanged", (accounts) => {
        console.log(accounts[0])
        fetchAccountData();
    });

    fetchAccountData();
}




async function toggleBorder(id, type) {
    if (document.getElementById("checkboxOf-" + id).checked) {
        if (type == "s") {
            selectedStakedAgents.push(id);
        } else {
            selectedOwnedAgents.push(id);
        }
        document.getElementById("token-" + id).style.border = "2px solid #ff0";
        document.getElementById("token-" + id).style.boxShadow = "0px 0px 5px #ff0";
    } else {
        if (type == "s") {
            if (selectedStakedAgents.indexOf(id) !== -1) {
                selectedStakedAgents.splice(selectedStakedAgents.indexOf(id), 1);
            }
        } else {
            if (selectedOwnedAgents.indexOf(id) !== -1) {
                selectedOwnedAgents.splice(selectedOwnedAgents.indexOf(id), 1);
            }
        }
        document.getElementById("token-" + id).style.border = "2px solid rgb(0 0 0 / 0%)";
        document.getElementById("token-" + id).style.boxShadow = "0px 0px 5px rgb(0 0 0 / 0%)";
    }
    if (selectedStakedAgents.length > 0) {
        document.getElementById("unstakeButton").disabled = false
    } else {
        document.getElementById("unstakeButton").disabled = true
    }

    if (selectedOwnedAgents.length > 0) {
        document.getElementById("stakeButton").disabled = false
    } else {
        document.getElementById("stakeButton").disabled = true
    }
}
async function toggleCheckBox(id, type) {
    document.getElementById("checkboxOf-" + id).checked = !document.getElementById("checkboxOf-" + id).checked;

    if (document.getElementById("checkboxOf-" + id).checked) {
        if (type == "s") {
            selectedStakedAgents.push(id);
        } else {
            selectedOwnedAgents.push(id);
        }
        document.getElementById("token-" + id).style.border = "2px solid #ff0";
        document.getElementById("token-" + id).style.boxShadow = "0px 0px 5px #ff0";
    } else {
        if (type == "s") {
            if (selectedStakedAgents.indexOf(id) !== -1) {
                selectedStakedAgents.splice(selectedStakedAgents.indexOf(id), 1);
            }
        } else {

            if (selectedOwnedAgents.indexOf(id) !== -1) {
                selectedOwnedAgents.splice(selectedOwnedAgents.indexOf(id), 1);
            }
        }
        document.getElementById("token-" + id).style.border = "2px solid rgb(0 0 0 / 0%)";
        document.getElementById("token-" + id).style.boxShadow = "0px 0px 5px rgb(0 0 0 / 0%)";
    }
    if (selectedStakedAgents.length > 0) {
        document.getElementById("unstakeButton").disabled = false
    } else {
        document.getElementById("unstakeButton").disabled = true
    }

    if (selectedOwnedAgents.length > 0) {
        document.getElementById("stakeButton").disabled = false;
    } else {
        document.getElementById("stakeButton").disabled = true;
    }
}




async function fetchProfile() {
    let res = await axios.post("http://localhost:3000/getProfile/", {
        token: localStorage.getItem("auth")
    })
    if (res.data.authenticated !== false) {


        document.getElementById("walletAddress-sm").value = selectedAccount;
        document.getElementById("walletAddress-lg").value = selectedAccount;

        document.getElementById("discord-sm").value = res.data.profile.discord;
        document.getElementById("discord-lg").value = res.data.profile.discord;

        document.getElementById("twitter-sm").value = res.data.profile.twitter;
        document.getElementById("twitter-lg").value = res.data.profile.twitter;


        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    }
}

async function updateProfile_sm() {
    let res = await axios.post("http://localhost:3000/updateProfile/", {
        token: localStorage.getItem("auth"),
        newProfile: {
            discord: document.getElementById("discord-sm").value,
            twitter: document.getElementById("twitter-sm").value,
            wlAddress: document.getElementById("wlAddress-sm").value,
            email: document.getElementById("email-sm").value
        }
    })
    if (res.data.error == undefined) {
        alert("updated")
        document.getElementById("walletAddress-sm").value = selectedAccount;
        document.getElementById("walletAddress-lg").value = selectedAccount;

        document.getElementById("discord-sm").value = res.data.profile.discord;
        document.getElementById("discord-lg").value = res.data.profile.discord;

        document.getElementById("twitter-sm").value = res.data.profile.twitter;
        document.getElementById("twitter-lg").value = res.data.profile.twitter;


        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    }
}


async function updateProfile_lg() {
    let res = await axios.post("http://localhost:3000/updateProfile/", {
        token: localStorage.getItem("auth"),
        newProfile: {
            discord: document.getElementById("discord-lg").value,
            twitter: document.getElementById("twitter-lg").value,
            wlAddress: document.getElementById("wlAddress-lg").value,
            email: document.getElementById("email-lg").value
        }
    })
    if (res.data.error == undefined) {
        alert("updated")
        document.getElementById("walletAddress-sm").value = selectedAccount;
        document.getElementById("walletAddress-lg").value = selectedAccount;

        document.getElementById("discord-sm").value = res.data.profile.discord;
        document.getElementById("discord-lg").value = res.data.profile.discord;

        document.getElementById("twitter-sm").value = res.data.profile.twitter;
        document.getElementById("twitter-lg").value = res.data.profile.twitter;


        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    }
}


async function connect() {
    if (window.web3 == undefined && window.ethereum == undefined) {
        window
            .open("https://metamask.app.link/dapp/artificialintelligenceclub.io", "_blank")
            .focus();
    }
    provider = await web3Modal.connect();
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    await fetchAccountData();
    if (isConnected) {
        return
    }

    if (localStorage.getItem("auth") == null) {
        const web3 = new Web3(provider);
        let time = Math.floor(new Date().getTime() / 1000)
        let signature = await web3.eth.personal.sign(`${selectedAccount.toLowerCase()}+${time}`, selectedAccount);
        let res = await axios.post("http://localhost:3000/auth/", {
            wallet: selectedAccount.toLowerCase(),
            signature: signature,
            time: time
        })
        if (res.data.token !== undefined) {
            localStorage.setItem("auth", res.data.token);
            localStorage.setItem("address", res.data.address);
            localStorage.setItem("time", time);
            fetchProfile();
        }

    } else {
        let res = await axios.post("http://localhost:3000/isAuthValid/", {
            wallet: selectedAccount.toLowerCase(),
            token: localStorage.getItem("auth")
        })
        if (res.data.authenticated == false) {
            localStorage.clear();
            const web3 = new Web3(provider);
            let time = Math.floor(new Date().getTime() / 1000)
            let signature = await web3.eth.personal.sign(`${selectedAccount.toLowerCase()}+${time}`, selectedAccount);
            let res = await axios.post("http://localhost:3000/auth/", {
                wallet: selectedAccount.toLowerCase(),
                signature: signature,
                time: time
            })
            if (res.data.token !== undefined) {
                localStorage.setItem("auth", res.data.token);
                localStorage.setItem("address", res.data.address);
                localStorage.setItem("time", time);
                fetchProfile();
            }
        } else {
            fetchProfile();
        }
    }

    if (selectedAccount) {
        document.getElementById("connect-button-sm").classList.add("d-none");
        document.getElementById("connect-button-sm").classList.remove("d-flex");

        document.getElementById("connect-button-lg").classList.add("d-none");
        document.getElementById("connect-button-lg").classList.remove("d-lg-flex");


        document.getElementById("wallet-button-sm").classList.add("d-flex");
        document.getElementById("wallet-button-sm").classList.remove("d-none");

        document.getElementById("wallet-button-lg").classList.add("d-lg-flex");


        document.getElementById("wallet-button-sm").innerHTML = `<img src="../images/whiteWallet.svg" alt="">  ${selectedAccount.substr(0,5)}...${selectedAccount.substr(selectedAccount.length - 4,selectedAccount.length)}`
        document.getElementById("wallet-button-lg").innerHTML = `<img src="../images/whiteWallet.svg" alt="">  ${selectedAccount.substr(0,5)}...${selectedAccount.substr(selectedAccount.length - 4,selectedAccount.length)}`
        isConnected = true;
    }
}

async function disconnect() {
    selectedAccount = undefined;
    isConnected = false;
    document.getElementById("connect-button-sm").classList.remove("d-none");
    document.getElementById("connect-button-sm").classList.add("d-flex");

    document.getElementById("connect-button-lg").classList.remove("d-none");
    document.getElementById("connect-button-lg").classList.add("d-lg-flex");


    document.getElementById("wallet-button-sm").classList.remove("d-flex");
    document.getElementById("wallet-button-sm").classList.add("d-none");

    document.getElementById("wallet-button-lg").classList.remove("d-lg-flex");


    localStorage.clear();

}

window.addEventListener("load", async () => {
    init();

})