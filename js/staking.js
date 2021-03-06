"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;
let isEligibleForOG = false;
let isEligibleForPR = false;

let contractAddress = (isLocalHost()) ? "0xAEe90Fbf15448e9FA46419ddd075858a571E16e4" : "0x1FdBAaF5A73c308A3D66F620201983A28b49d7f6";
let mainContractAddress = (isLocalHost()) ? "0xB54984BEBDA259e5f52191fAA2D234692775a2aE" : "0xB78f1A96F6359Ef871f594Acb26900e02bFc8D00";
let apiUrl = (isLocalHost()) ? "http://localhost" : "https://mapi.artificialintelligenceclub.io";
let abi = [{
        "inputs": [{
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }],
        "name": "tokensOwnedBy",
        "outputs": [{
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
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

function isLocalHost() {
    return window.location.hostname.indexOf('localhost') !== -1 || window.location.hostname.indexOf('127.0.0.1') !== -1;
}

let selectedStakedAgents = [];
let selectedOwnedAgents = [];

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
    loadTokens()
}




async function updateProfile_sm() {
    toastr.info("Updating");
    let res = await axios.post(apiUrl + "/updateProfile/", {
        token: localStorage.getItem("auth"),
        newProfile: {
            discord: document.getElementById("discord-sm").value,
            twitter: document.getElementById("twitter-sm").value,
            solAddress: document.getElementById("solAddress-sm").value,
            wlAddress: document.getElementById("wlAddress-sm").value,
            email: document.getElementById("email-sm").value
        }
    })
    if (res.data.error == undefined) {
        toastr.success("Updated");
        document.getElementById("walletAddress-sm").value = selectedAccount;
        document.getElementById("walletAddress-lg").value = selectedAccount;

        document.getElementById("discord-sm").value = res.data.profile.discord;
        document.getElementById("discord-lg").value = res.data.profile.discord;

        document.getElementById("twitter-sm").value = res.data.profile.twitter;
        document.getElementById("twitter-lg").value = res.data.profile.twitter;

        document.getElementById("solAddress-sm").value = res.data.profile.solAddress;
        document.getElementById("solAddress-lg").value = res.data.profile.solAddress;


        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    } else {

        toastr.error(res.data.desc);
    }
}


async function updateProfile_lg() {
    toastr.info("Updating");
    let res = await axios.post(apiUrl + "/updateProfile/", {
        token: localStorage.getItem("auth"),
        newProfile: {
            discord: document.getElementById("discord-lg").value,
            twitter: document.getElementById("twitter-lg").value,
            solAddress: document.getElementById("solAddress-lg").value,
            wlAddress: document.getElementById("wlAddress-lg").value,
            email: document.getElementById("email-lg").value
        }
    })
    if (res.data.error == undefined) {
        toastr.success("Updated");
        document.getElementById("walletAddress-sm").value = selectedAccount;
        document.getElementById("walletAddress-lg").value = selectedAccount;

        document.getElementById("discord-sm").value = res.data.profile.discord;
        document.getElementById("discord-lg").value = res.data.profile.discord;

        document.getElementById("twitter-sm").value = res.data.profile.twitter;
        document.getElementById("twitter-lg").value = res.data.profile.twitter;

        document.getElementById("solAddress-sm").value = res.data.profile.solAddress;
        document.getElementById("solAddress-lg").value = res.data.solAddress;

        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    } else {

        toastr.error(res.data.desc);
    }
}


async function fetchHistory() {
    let res = await axios.post(apiUrl + "/getHistory/", {
        token: localStorage.getItem("auth")
    })
    if (res.data.authenticated !== false) {
        document.getElementById("history-lg").innerHTML = "";
        document.getElementById("history-sm").innerHTML = "";
        res.data.history.forEach(item => {
            let newItem = `<div class="row">
        <div class="col-3 mb-3">
            <img class="rounded w-100" src="${item.image}" alt="${item.name}">
        </div>
        <div class="col-9 text-start my-auto">
            <p class="font13">${item.name}</p>
            <p class="font14">Claim date : ${getDateFromUnix(item.claimTime)}
            </p>
        </div>
        </div>`

            document.getElementById("history-sm").innerHTML += newItem;
            document.getElementById("history-lg").innerHTML += newItem;
        })
    } else {
        toastr.error(res.data.desc);
    }

}


async function fetchProfile() {
    let res = await axios.post(apiUrl + "/getProfile/", {
        token: localStorage.getItem("auth")
    })
    if (res.data.authenticated !== false) {
        document.getElementById("walletAddress-sm").value = selectedAccount;
        document.getElementById("walletAddress-lg").value = selectedAccount;

        document.getElementById("discord-sm").value = res.data.profile.discord;
        document.getElementById("discord-lg").value = res.data.profile.discord;

        document.getElementById("twitter-sm").value = res.data.profile.twitter;
        document.getElementById("twitter-lg").value = res.data.profile.twitter;

        document.getElementById("solAddress-sm").value = (res.data.profile.solAddress !== undefined)?res.data.profile.solAddress:"";
        document.getElementById("solAddress-lg").value = (res.data.profile.solAddress !== undefined)?res.data.profile.solAddress:"";


        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    } else {
        toastr.error(res.data.desc);
    }
}

async function connect() {

    if (window.web3 == undefined && window.ethereum == undefined) {
        window
            .open("https://metamask.app.link/dapp/mapi.artificialintelligenceclub.io", "_blank")
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
        let res = await axios.post(apiUrl + "/auth/", {
            wallet: selectedAccount.toLowerCase(),
            signature: signature,
            time: time
        })
        if (res.data.token !== undefined) {
            localStorage.setItem("auth", res.data.token);
            localStorage.setItem("address", res.data.address);
            localStorage.setItem("time", time);
            fetchProfile();
            fetchHistory();
        } else {
            toastr.error(res.data.desc);
        }
    } else {
        let res = await axios.post(apiUrl + "/isAuthValid/", {
            wallet: selectedAccount.toLowerCase(),
            token: localStorage.getItem("auth")
        })
        if (res.data.authenticated == false) {
            localStorage.clear();
            const web3 = new Web3(provider);
            let time = Math.floor(new Date().getTime() / 1000)
            let signature = await web3.eth.personal.sign(`${selectedAccount.toLowerCase()}+${time}`, selectedAccount);
            let res = await axios.post(apiUrl + "/auth/", {
                wallet: selectedAccount.toLowerCase(),
                signature: signature,
                time: time
            })
            if (res.data.token !== undefined) {
                localStorage.setItem("auth", res.data.token);
                localStorage.setItem("address", res.data.address);
                localStorage.setItem("time", time);
                fetchProfile();
                fetchHistory();
            } else {
                toastr.error(res.data.desc);
            }
        } else {
            fetchProfile();
            fetchHistory();
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

        document.getElementById("profile-button-sm").classList.add("d-flex");
        document.getElementById("profile-button-sm").classList.remove("d-none");
        document.getElementById("profile-button-lg").classList.add("d-lg-flex");


        document.getElementById("wallet-button-sm").innerHTML = `<img src="../images/whiteWallet.svg" alt="">  ${selectedAccount.substr(0,5)}...${selectedAccount.substr(selectedAccount.length - 4,selectedAccount.length)}`
        document.getElementById("wallet-button-lg").innerHTML = `<img src="../images/whiteWallet.svg" alt="">  ${selectedAccount.substr(0,5)}...${selectedAccount.substr(selectedAccount.length - 4,selectedAccount.length)}`
        toastr.success('Connected')
        isConnected = true;
    }
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

function secondsToDhm(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " min" : " mins") : "";
    if (dDisplay + hDisplay + mDisplay == "") {
        return "1 min";
    } else {
        return dDisplay + hDisplay + mDisplay;
    }

}

function secondsToDh(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " DAY, " : " DAYS, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " HOUR " : " HOURS ") : "";
    if (dDisplay + hDisplay == "") {
        return "0 HOURS";
    } else {
        return dDisplay + hDisplay;
    }

}

function getDateFromUnix(unixTime) {
    let date = new Date(unixTime * 1000);
    let day = date.getDate()
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    switch (day) {
        case 1:
        case 21:
        case 31:
            return day + 'st ' + months[date.getMonth()] + ", " + date.getFullYear()
        case 2:
        case 22:
            return day + 'nd ' + months[date.getMonth()] + ", " + date.getFullYear()
        case 3:
        case 23:
            return day + 'rd ' + months[date.getMonth()] + ", " + date.getFullYear()
        default:
            return day + 'th ' + months[date.getMonth()] + ", " + date.getFullYear()
    }
}

async function loadTokens() {
    selectedStakedAgents = [];
    selectedOwnedAgents = [];
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, contractAddress);
    contract.methods.tokensOwnedBy(selectedAccount).call().then(tokens => {
        document.getElementById("ownedTokens").innerHTML = "";
        tokens.forEach(tokenId => {

            document.getElementById("ownedTokens").innerHTML += `
    <div class="col-12 col-sm-8 col-md-5 col-lg-4 col-xl-6">
            <div class="rounded m-2 pb-5 bg2 row justify-content-center">
                <div>
                    <div id="token-${tokenId}" class="position-relative my-2 mt-3 mx-auto rounded-3 widthfit"style="border:2px solid rgb(0 0 0 / 0%)">
                        <div class="form-check position-absolute checkpos p-0">
                            <input class="form-check-input rounded-circle selectable1" onclick="toggleBorder(${tokenId},'o');"
                                type="checkbox" value="" id="checkboxOf-${tokenId}"style="cursor:pointer;">
                        </div>
                        <a class="btn p-0" onclick="toggleCheckBox(${tokenId},'o');">
                            <img class="rounded w-100" src="${imagesUrls[tokenId]}" alt="">
                        </a>
                    </div>
                </div>
                <h5 class="font6 my-1">Agent #${tokenId}</h5>
            </div>
        </div>`
        })
        if (tokens.length == 0) {
            document.getElementById("ownedTokens").innerHTML = `<h6 class="font3 my-5">No agents owned</h6>`
        }

    })


    contract.methods.tokensStakedBy(selectedAccount).call().then(tokens => {
        document.getElementById("stakedTokens").innerHTML = "";
        let isTokensStaked = false;
        tokens.forEach(async (state, tokenId) => {
            tokenId += 1;
            if (state == true) {
                isTokensStaked = true;
                let tokenData = await contract.methods.checkStakeTierOfToken(tokenId).call();

                let passedPercent = (tokenData.passedTime / (30 * 24 * 60 * 60) * 100).toFixed(2);
                let circle5 = (tokenData.passedTime >= 5 * 24 * 60 * 60) ? "color1" : "color2";
                let circle15 = (tokenData.passedTime >= 15 * 24 * 60 * 60) ? "color1" : "color2";
                let circle30 = (tokenData.passedTime >= 30 * 24 * 60 * 60) ? "color1" : "color2";
                document.getElementById("stakedTokens").innerHTML += `<div class="col-12 col-sm-8 col-md-5 col-lg-4 col-xl-4">
                <div class="rounded m-2 bg2 row justify-content-center">
                    <div>
                        <div id="token-${tokenId}" class="position-relative my-2 mt-3 mx-auto rounded-3 widthfit"style="border:2px solid rgb(0 0 0 / 0%)">
                            <div class="form-check position-absolute checkpos p-0">
                                <input class="form-check-input rounded-circle selectable1" onclick="toggleBorder(${tokenId},'s');"
                                    type="checkbox" value=""id="checkboxOf-${tokenId}" style="cursor:pointer;">
                            </div>
                            <a class="btn p-0" data-toggle="modal" data-target="#modalForToken-${tokenId}">
                                <img class="rounded w-100" src="${imagesUrls[tokenId]}" alt="">
                            </a>
                        </div>
                        <div class="modal fade" id="modalForToken-${tokenId}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                            aria-hidden="true">
                            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                                <div class="modal-content rounded-3 bg1">
                                    <div class="modal-header py-0 pt-4 m-start text-light border-0 bg1">
                                        <p></p>
                                        <button type="button m-start"
                                            class="btn-close btn-close-white btnn graybtn font1 p-2 mx-2 text-light close border-0"
                                            data-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body my-0 mb-5">
                                        <div class="mx-4 d-md-flex pb-5">
                                            <img class="col-9 col-md-4 rounded" src="${imagesUrls[tokenId]}" alt="">
                                            <div class="my-auto px-3 text-start">
                                                <h2 class="font3 mt-3 mb-0">Agent #${tokenId}
                                                </h2>
                                                <br>
                                                <p class="text-center tier px-2 rounded-pill w-100">Stake
                                                    Tier ${tokenData.tierId}</p>
            
                                                <h4 class="font7"><span class="font4">Staked Duration:
                                                    </span>${secondsToDhm(tokenData.passedTime)}</h4>
                                                <h4 class="font7"><span class="font4">Staked Since:
                                                    </span>${getDateFromUnix(tokenData.stakeDate)}</h4>
                                            </div>
                                        </div>
                                        <div class="position-relative mx-5 mb-4">
                                            <div class="progress p-0 rounded-pill progress1">
                                                <div class="progress-bar progressbar1" role="progressbar" aria-valuenow="10" style="width:${passedPercent}%"
                                                    aria-valuemin="0" aria-valuemax="100">
                                                </div>
                                            </div>
                                            <div class="position-absolute pos1 text-center">
                                                <div class="rounded-circle progresscircle ${circle5} m-auto">
                                                    <p class="py-sm-1 progressfont">1</p>
                                                </div>
                                                <p class="mt-2 font2">5 Days</p>
                                            </div>
                                            <div class="position-absolute pos2">
                                                <div class="rounded-circle progresscircle ${circle15} m-auto">
                                                    <p class="py-sm-1 progressfont">2</p>
                                                </div>
                                                <p class="mt-2 font2">15 Days</p>
                                            </div>
                                            <div class="position-absolute pos3">
                                                <div class="rounded-circle progresscircle ${circle30} m-auto">
                                                    <p class="py-sm-1 progressfont">3</p>
                                                </div>
                                                <p class="mt-2 font2">30 Days</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
            
                    </div>
                    <h5 class="font6 my-1">Agent #${tokenId}</h5>
                    <p class="tier rounded-pill mt-3">Stake level: ${tokenData.tierId}</p>
                </div>
            </div>`
            }

            if (tokenId == 314) {
                if (isTokensStaked == false) {
                    document.getElementById("stakedTokens").innerHTML = `<h6 class="font3 my-5">No agents staked</h6>`
                }
            }
        })

    })
}


async function stakeAll() {
    const web3 = new Web3(provider);
    const stakingContract = new web3.eth.Contract(abi, contractAddress);
    const mainContract = new web3.eth.Contract(abi, mainContractAddress);
    let isApproved = await mainContract.methods.isApprovedForAll(selectedAccount, contractAddress).call();
    let tokensOwned = await stakingContract.methods.tokensOwnedBy(selectedAccount).call();

    if (tokensOwned.length == 0) {
        console.log("0 tokens owned")
        return
    }
    if (isApproved) {
        stakingContract.methods.stake(tokensOwned).send({
            from: selectedAccount
        }).then(status => {
            loadTokens()
        })
    } else {
        mainContract.methods.setApprovalForAll(contractAddress, true).send({
            from: selectedAccount
        }).finally(() => {
            stakingContract.methods.stake(tokensOwned).send({
                from: selectedAccount
            }).then(statusx => {
                loadTokens();
            })
        })
    }
}


async function stake() {
    const web3 = new Web3(provider);
    const stakingContract = new web3.eth.Contract(abi, contractAddress);
    const mainContract = new web3.eth.Contract(abi, mainContractAddress);
    let isApproved = await mainContract.methods.isApprovedForAll(selectedAccount, contractAddress).call();


    if (selectedOwnedAgents.length == 0) {
        console.log("0 tokens selected")
        return
    }

    if (isApproved) {
        stakingContract.methods.stake(selectedOwnedAgents).send({
            from: selectedAccount
        }).then(status => {
            loadTokens()
        })
    } else {
        mainContract.methods.setApprovalForAll(contractAddress, true).send({
            from: selectedAccount
        }).finally(() => {
            console.log("Approved all.")
            stakingContract.methods.stake(selectedOwnedAgents).send({
                from: selectedAccount
            }).then(statusx => {
                console.log("Staked all.")
                loadTokens()
            })
        })
    }
}



async function unstakeAll() {
    const web3 = new Web3(provider);
    const stakingContract = new web3.eth.Contract(abi, contractAddress);
    let tokensStaked = await stakingContract.methods.tokensStakedBy(selectedAccount).call();
    let tokensStakedIds = [];
    tokensStaked.forEach((state, tokenId) => {
        if (state == true) {
            tokensStakedIds.push(tokenId + 1)
        }
    })
    if (tokensStakedIds.length == 0) {
        console.log("0 tokens owned")
        return
    }
    stakingContract.methods.unstake(tokensStakedIds).send({
        from: selectedAccount
    }).then(status => {
        loadTokens()
    })
}

async function unstake() {
    const web3 = new Web3(provider);
    const stakingContract = new web3.eth.Contract(abi, contractAddress);

    if (selectedStakedAgents.length == 0) {
        console.log("0 tokens selected")
        return
    }

    stakingContract.methods.unstake(selectedStakedAgents).send({
        from: selectedAccount
    }).then(status => {
        loadTokens()
    })
}

async function loadSeasonEnds() {
    try {
        let network;
        if (isLocalHost()) {
            network = "rinkeby"
        } else {
            network = "mainnet"
        }
        const web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/5ad686d1f5ab4565a30a8ae793e209bc`));
        const stakingContract = new web3.eth.Contract(abi, contractAddress);
        let time = await stakingContract.methods.currentSeasonStartTime().call();

        document.getElementById("seasonEndsLabel").innerHTML = "SEASONS ENDS : " + secondsToDh((parseInt(time) + 40 * 24 * 60 * 60) - Math.floor(Date.now() / 1000));


    } catch (error) {
        console.log(error)
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


    document.getElementById("profile-button-sm").classList.remove("d-flex");
    document.getElementById("profile-button-sm").classList.add("d-none");
    document.getElementById("profile-button-lg").classList.remove("d-lg-flex");

    document.getElementById("stakedTokens").innerHTML = '<h3 class="font3 my-5">Must connect first</h3>';
    document.getElementById("ownedTokens").innerHTML = '<h3 class="font3 my-5">Must connect first</h3>';
    localStorage.clear();
    toastr.error('Disconnected')

}

window.addEventListener("load", async () => {
    init();
    loadSeasonEnds()
})