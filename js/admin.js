"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;
let isEligibleForOG = false;
let isEligibleForPR = false;
let agentsSelected = {};
let agentsStaked = {};
let itemsFetched;
let highestTier = 0;
let filterArray = [];


let apiUrl = (isLocalHost()) ? "http://localhost" : "https://mapi.artificialintelligenceclub.io";

function isLocalHost() {
    return window.location.hostname.indexOf('localhost') !== -1 || window.location.hostname.indexOf('127.0.0.1') !== -1;
}
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

async function updateProfile_sm() {
    toastr.info("Updating");
    let res = await axios.post(apiUrl + "/updateProfile/", {
        token: localStorage.getItem("auth"),
        newProfile: {
            discord: document.getElementById("discord-sm").value,
            twitter: document.getElementById("twitter-sm").value,
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


        document.getElementById("wlAddress-sm").value = res.data.profile.wlAddress;
        document.getElementById("wlAddress-lg").value = res.data.profile.wlAddress;


        document.getElementById("email-sm").value = res.data.profile.email;
        document.getElementById("email-lg").value = res.data.profile.email;
    } else {
        toastr.error(res.data.desc);
    }
}


async function claimItem(itemId) {
    toastr.info("Claiming item");
    let tokenId;

    let radios = document.getElementsByName("checkbox-i" + itemId)

    radios.forEach(radio => {
        if (radio.checked == true) {

            tokenId = radio.value
        }
    })

    if (tokenId == undefined) {
        alert("No agent selected");
        return
    }

    let res = await axios.post(apiUrl + "/claimItem/", {
        token: localStorage.getItem("auth"),
        itemId: itemId,
        tokenId: tokenId
    })
    if (res.data.error == false) {
        toastr.success("Item claimed");
    } else {
        toastr.error(res.data.desc);
    }
}

async function fetchItem() {

    if (document.getElementById("e-itemId").value) {
        let res = await axios.post(apiUrl + "/fetchItem/", {
            token: localStorage.getItem("auth"),
            itemId: document.getElementById("e-itemId").value
        })
        if (res.data.error == undefined) {
            document.getElementById("e-itemName").value = res.data.item.name;
            document.getElementById("e-itemImage").value = res.data.item.image;
            document.getElementById("e-itemQuantity").value = res.data.item.quantity;
            document.getElementById("e-itemTierId").value = res.data.item.tierId;
            document.getElementById("e-itemEnabled").checked = res.data.item.enabled;
            document.getElementById("e-itemLastSubmitTime").value = res.data.item.lastSubmitTime;

            document.getElementById("e-itemName").disabled = false;
            document.getElementById("e-itemImage").disabled = false;
            document.getElementById("e-itemQuantity").disabled = false;
            document.getElementById("e-itemTierId").disabled = false;
            document.getElementById("e-itemEnabled").disabled = false;
            document.getElementById("e-itemLastSubmitTime").disabled = false;
            document.getElementById("e-confirm").disabled = false;
            toastr.success("Fetched");
        } else {
            document.getElementById("e-itemName").value = "";
            document.getElementById("e-itemImage").value = "";
            document.getElementById("e-itemQuantity").value = "";
            document.getElementById("e-itemTierId").value = "";
            document.getElementById("e-itemEnabled").checked = false;
            document.getElementById("e-itemLastSubmitTime").value = "";

            document.getElementById("e-itemName").disabled = true;
            document.getElementById("e-itemImage").disabled = true;
            document.getElementById("e-itemQuantity").disabled = true;
            document.getElementById("e-itemTierId").disabled = true;
            document.getElementById("e-itemEnabled").disabled = true;
            document.getElementById("e-itemLastSubmitTime").disabled = true;
            document.getElementById("e-confirm").disabled = true;
            toastr.error(res.data.desc);
        }
    } else {
        toastr.error(`Could't fetch "${document.getElementById("e-itemId").value}"`);
    }

}

async function editItem() {

    if (document.getElementById("e-itemId").value) {
        let res = await axios.post(apiUrl + "/updateItem/", {
            token: localStorage.getItem("auth"),
            itemId: document.getElementById("e-itemId").value,
            updatedItem: {
                name: document.getElementById("e-itemName").value,
                image: document.getElementById("e-itemImage").value,
                quantity: document.getElementById("e-itemQuantity").value,
                tierId: document.getElementById("e-itemTierId").value,
                enabled: document.getElementById("e-itemEnabled").checked,
                lastSubmitTime: document.getElementById("e-itemLastSubmitTime").value
            }
        })
        if (res.data.error == undefined) {
            toastr.success("Updated");
        } else {
            toastr.error(res.data.desc);
        }
    } else {
        toastr.error(`Couldn't update "${document.getElementById("e-itemId").value}"`);
    }

}

async function downloadWlAddresses() {

    let res = await axios.post(apiUrl + "/fetchWlAddresses/", {
        token: localStorage.getItem("auth"),
        itemId: document.getElementById("d-itemId").value
    })
    if (res.data.error == undefined) {
        downloadObjectAsJson({wl:res.data.item.wlAddresses,claimed:res.data.item.claimedAddresses}, "list");
        toastr.success("");
    } else {
        toastr.error(res.data.desc);
    }


}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
async function createItem() {


    let res = await axios.post(apiUrl + "/createItem/", {
        token: localStorage.getItem("auth"),
        newItem: {
            name: document.getElementById("c-itemName").value,
            image: document.getElementById("c-itemImage").value,
            quantity: document.getElementById("c-itemQuantity").value,
            tierId: document.getElementById("c-itemTierId").value,
            enabled: document.getElementById("c-itemEnabled").checked,
            lastSubmitTime: document.getElementById("c-itemLastSubmitTime").value
        }
    })
    if (res.data.error == undefined) {
        toastr.success(`Created successfully -- Id:${res.data.itemId}`);
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

    localStorage.clear();
    toastr.error('Disconnected')

}

window.addEventListener("load", async () => {
    init();

})