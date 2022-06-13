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




async function toggleBorder(id) {
    let radios = document.getElementsByName("checkbox-i" + id)
    document.getElementById(`claim-${id}`).disabled = false;
    radios.forEach(radio => {
        if (radio.checked == true) {
            document.getElementById(radio.id.substring(1, radio.id.length)).style.border = "2px solid #ff0";
            document.getElementById(radio.id.substring(1, radio.id.length)).style.boxShadow = "0px 0px 5px #ff0";
        } else {
            document.getElementById(radio.id.substring(1, radio.id.length)).style.border = "2px solid rgb(0 0 0 / 0%)";
            document.getElementById(radio.id.substring(1, radio.id.length)).style.boxShadow = "0px 0px 5px rgb(0 0 0 / 0%)";
        }
    })
}
async function toggleCheckbox(id, itemId) {

    document.getElementById(id).checked = true
    document.getElementById(`claim-${itemId}`).disabled = false;
    let radios = document.getElementsByName("checkbox-i" + itemId)
    radios.forEach(radio => {
        if (radio.checked == true) {
            document.getElementById(radio.id.substring(1, radio.id.length)).style.border = "2px solid #ff0";
            document.getElementById(radio.id.substring(1, radio.id.length)).style.boxShadow = "0px 0px 5px #ff0";
        } else {
            document.getElementById(radio.id.substring(1, radio.id.length)).style.border = "2px solid rgb(0 0 0 / 0%)";
            document.getElementById(radio.id.substring(1, radio.id.length)).style.boxShadow = "0px 0px 5px rgb(0 0 0 / 0%)";
        }
    })
}



async function updateProfile_sm() {
    toastr.info("Updating");
    let res = await axios.post("https://mapi.artificialintelligenceclub.io/updateProfile/", {
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
    let res = await axios.post("https://mapi.artificialintelligenceclub.io/updateProfile/", {
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
    let res = await axios.post("https://mapi.artificialintelligenceclub.io/getHistory/", {
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
    let res = await axios.post("https://mapi.artificialintelligenceclub.io/getProfile/", {
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

    let res = await axios.post("https://mapi.artificialintelligenceclub.io/claimItem/", {
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
async function fetchItems() {
    toastr.info("Fetching items");
    const web3 = new Web3(provider);
    const stakingContract = new web3.eth.Contract(abi, contractAddress);
    let tokensStaked = await stakingContract.methods.tokensStakedBy(selectedAccount).call();
    let tokensStakedIds = [];

    tokensStaked.forEach((state, tokenId) => {
        if (state == true) {
            tokensStakedIds.push(tokenId + 1)
        }
    })

    itemsFetched = await axios.post("https://mapi.artificialintelligenceclub.io/getItems/", {
        token: localStorage.getItem("auth")
    })
    axios.post("https://mapi.artificialintelligenceclub.io/checkAgentsClaimDate/", {
        token: localStorage.getItem("auth"),
        agents: tokensStakedIds
    }).then(async res => {

        if (res.data.desc == undefined) {
            for (let index = 0; index < tokensStakedIds.length; index++) {
                let tokenData = await stakingContract.methods.checkStakeTierOfToken(tokensStakedIds[index]).call();

                if (tokenData.tierId > highestTier) {
                    highestTier = tokenData.tierId;
                }
                if (res.data.agents[tokensStakedIds[index]] !== undefined) {
                    agentsStaked[tokensStakedIds[index]] = {
                        claimTime: res.data.agents[tokensStakedIds[index]],
                        tierId: tokenData.tierId
                    }
                } else {
                    agentsStaked[tokensStakedIds[index]] = {
                        claimTime: 0,
                        tierId: tokenData.tierId
                    };
                }

            }
            // items making 


            // must be done in the filter if there are more filters!


            document.getElementById("marketplace-items").innerHTML = ""
            let tier1TotalTokens = 0;
            let tier2TotalTokens = 0;
            let tier3TotalTokens = 0;
            itemsFetched.data.items.forEach(item => {

                let isClaimable = true;
                if (item.quantityLeft <= 0) {
                    isClaimable = false;
                }
                if (item.tierId > highestTier) {
                    isClaimable = false;
                }
                if (item.claimed) {
                    isClaimable = false;
                }


                let agentsAvailable = "";
                let agentsAvailableCount = 0;
                Object.keys(agentsStaked).forEach((agentId, index) => {

                    if (agentsStaked[agentId].tierId >= item.tierId && agentsStaked[agentId].claimTime < (Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60)) {
                        agentsAvailableCount++;
                        agentsAvailable += ` <div class="col-3 mx-3 justify-content-center">
<div id="${index}-${item.id}" class="position-relative my-2 mt-3 rounded-3"style="border:2px solid rgb(0 0 0 / 0%)">
    <div class="form-check position-absolute checkpos p-0">
        <input
            class="form-check-input rounded-circle selectable1"
            onclick="toggleBorder('${item.id}');" type="radio" name="checkbox-i${item.id}"
            value="${agentId}" id="c${index}-${item.id}">
    </div>
    <a class="btn p-0" href="#" onclick="toggleCheckbox('c${index}-${item.id}','${item.id}')">
    <img class="rounded w-100" src="${imagesUrls[agentId]}"  alt="">
    </a>
    
</div>
<p class="text-center tier px-2 rounded-pill widthfit mx-auto">
    Stake Tier ${agentsStaked[agentId].tierId}</p>
</div>`
                    }
                })

                if (agentsAvailableCount > 0) {
                    if (item.tierId == 1) {
                        tier1TotalTokens++;
                    }
                    if (item.tierId == 2) {
                        tier2TotalTokens++;
                    }
                    if (item.tierId == 3) {
                        tier3TotalTokens++;
                    }
                    document.getElementById("marketplace-items").innerHTML += `
    <div class="col-5 col-md-4 col-lg-3 col-xxl-2 text-center text-light text-center mb-4 mt-0">
                <div class="rounded cardbg ">
                    <img class="col-11 rounded mt-2 mt-md-3" src="${item.image}" alt="">
                    <p class="font8 mt-1 mb-0">${item.name}</p>
                    <p class="font9 mt-2">${item.quantityLeft} Available</p>
                    <div class="d-flex justify-content-between pb-2 mx-2">
                        <p class="my-auto tier px-2 pb-1 rounded-pill">Tier ${item.tierId}</p>
                        ${(isClaimable)?`<button class="btn btnn yellowbtn p-1 pb-sm-2" class="btn btn-primary" data-toggle="modal"data-target="#modal-${item.id}"><p class="font31 m-0">Claim</p>
                    </button>`:`    <button class="btn btnn yellowbtn p-1 pb-sm-2" class="btn btn-primary"disabled>
                    <p class="font31 m-0">Claim</p>
                </button>`}
                        <div class="modal fade" id="modal-${item.id}" tabindex="-1" role="dialog"
                            aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered" role="document">
                                <div class="modal-content rounded-3 bg1">
                                    <div class="modal-header text-light bbg2">
                                        <h5 class="modal-title font5" id="exampleModalLongTitle">CLAIM ITEM</h5>
                                        <button type="button"
                                            class="btn-close btn-close-white btnn yellowbtn2 p-2 mx-2 text-light close border-0"
                                            data-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="border-bottom d-flex pb-5">
                                            <img class="col-5 rounded mt-4" src="${item.image}" alt="">
                                            <div class="my-auto px-3 text-start">
                                                <p class="font8 mt-3 mb-0">${item.name}
                                                </p>
                                                <p class="font9 mb-0">${item.quantityLeft} Available</p><br>
                                                <p class="my-auto tier px-2 rounded-pill widthfit">Tier ${item.tierId}</p>
                                            </div>
                                        </div>
                                        <div class="mt-4 text-start">
                                            <p class="font2">Please select the agent you would like to use to claim
                                                this item:</p>
                                            <div class="row">
                                               ${agentsAvailable}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer bbg2">
                                        <button type="button"
                                            class="btn btnn yellowbtn2 font31 p-2 mx-2 text-light close"
                                            data-dismiss="modal" aria-label="Close">CANCEL</button>
                                        <button type="button" class="btn btnn yellowbtn font31 p-2" onclick="claimItem('${item.id}');" id="claim-${item.id}" data-dismiss="modal" disabled>CLAIM
                                            ITEM</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
                }
            })
            if (tier1TotalTokens == 0) {
                document.getElementById("filter-sm-1").disabled = true
                document.getElementById("filter-lg-1").disabled = true
                document.getElementById("filter-sm-1").classList.add("dis");
                document.getElementById("filter-lg-1").classList.add("dis");
            } else {
                document.getElementById("filter-sm-1").disabled = false
                document.getElementById("filter-lg-1").disabled = false
                document.getElementById("filter-sm-1").classList.remove("dis");
                document.getElementById("filter-lg-1").classList.remove("dis");
            }
            if (tier2TotalTokens == 0) {
                document.getElementById("filter-sm-2").disabled = true
                document.getElementById("filter-lg-2").disabled = true
                document.getElementById("filter-sm-2").classList.add("dis");
                document.getElementById("filter-lg-2").classList.add("dis");
            } else {
                document.getElementById("filter-sm-2").disabled = false
                document.getElementById("filter-lg-2").disabled = false
                document.getElementById("filter-sm-2").classList.remove("dis");
                document.getElementById("filter-lg-2").classList.remove("dis");
            }
            if (tier3TotalTokens == 0) {
                document.getElementById("filter-sm-3").disabled = true
                document.getElementById("filter-lg-3").disabled = true
                document.getElementById("filter-sm-3").classList.add("dis");
                document.getElementById("filter-lg-3").classList.add("dis");
            } else {
                document.getElementById("filter-sm-3").disabled = false
                document.getElementById("filter-lg-3").disabled = false
                document.getElementById("filter-sm-3").classList.remove("dis");
                document.getElementById("filter-lg-3").classList.remove("dis");
            }
            document.getElementById("filter-sm-1-label").innerHTML = `Tier 1 (${tier1TotalTokens})`
            document.getElementById("filter-sm-2-label").innerHTML = `Tier 2 (${tier2TotalTokens})`
            document.getElementById("filter-sm-3-label").innerHTML = `Tier 3 (${tier3TotalTokens})`


            document.getElementById("filter-lg-1-label").innerHTML = `Tier 1 (${tier1TotalTokens})`
            document.getElementById("filter-lg-2-label").innerHTML = `Tier 2 (${tier2TotalTokens})`
            document.getElementById("filter-lg-3-label").innerHTML = `Tier 3 (${tier3TotalTokens})`
        } else {

            toastr.error(res.data.desc);
        }
    })
}

function toggleFilter(tierId) {

    switch (tierId) {
        case 1:
            if (filterArray.includes(1)) {
                filterArray.splice(filterArray.indexOf("1"), 1)
            } else {
                filterArray.push(1)
            }
            break;
        case 2:
            if (filterArray.includes(2)) {
                filterArray.splice(filterArray.indexOf(2), 1)
            } else {
                filterArray.push(2)
            }
            break;
        case 3:
            if (filterArray.includes(3)) {
                filterArray.splice(filterArray.indexOf(3), 1)
            } else {
                filterArray.push(3)
            }
            break;

        default:
            break;
    }
    if (filterArray.length == 0) {
        filterByTier([0, 1, 2, 3]);
    } else {
        filterByTier(filterArray);
    }

}

async function filterByTier(tierArray) {

    document.getElementById("marketplace-items").innerHTML = ""

    itemsFetched.data.items.forEach(item => {
        let isClaimable = true;
        if (item.quantityLeft <= 0) {
            isClaimable = false;
        }
        if (item.tierId > highestTier) {
            isClaimable = false;
        }
        if (item.claimed) {
            isClaimable = false;
        }


        let agentsAvailable = "";
        Object.keys(agentsStaked).forEach((agentId, index) => {

            if (agentsStaked[agentId].tierId >= item.tierId && agentsStaked[agentId].claimTime < (Math.floor(new Date().getTime() / 1000) + 24 * 60 * 60)) {
                agentsAvailable += ` <div class="col-3 mx-3 justify-content-center">
<div id="${index}-${item.id}" class="position-relative my-2 mt-3 rounded-3"style="border:2px solid rgb(0 0 0 / 0%)">
    <div class="form-check position-absolute checkpos p-0">
        <input
            class="form-check-input rounded-circle selectable1"
            onclick="toggleBorder('${item.id}');" type="radio" name="checkbox-i${item.id}"
            value="${agentId}" id="c${index}-${item.id}">
    </div>
    <a class="btn p-0" href="#" onclick="toggleCheckbox('c${index}-${item.id}','${item.id}')">
    <img class="rounded w-100" src="${imagesUrls[agentId]}"  alt="">
    </a>
    
</div>
<p class="text-center tier px-2 rounded-pill widthfit mx-auto">
    Stake Tier ${agentsStaked[agentId].tierId}</p>
</div>`
            }
        })

        if (tierArray.includes(item.tierId)) {
            document.getElementById("marketplace-items").innerHTML += `
            <div class="col-5 col-md-4 col-lg-3 col-xxl-2 text-center text-light text-center mb-4 mt-0">
                        <div class="rounded cardbg ">
                            <img class="col-11 rounded mt-2 mt-md-3" src="${item.image}" alt="">
                            <p class="font8 mt-1 mb-0">${item.name}</p>
                            <p class="font9 mt-2">${item.quantityLeft} Available</p>
                            <div class="d-flex justify-content-between pb-2 mx-2">
                                <p class="my-auto tier px-2 pb-1 rounded-pill">Tier ${item.tierId}</p>
                                ${(isClaimable)?`<button class="btn btnn yellowbtn p-1 pb-sm-2" class="btn btn-primary" data-toggle="modal"data-target="#modal1"><p class="font31 m-0">Claim</p>
                            </button>`:`    <button class="btn btnn yellowbtn p-1 pb-sm-2" class="btn btn-primary"disabled>
                            <p class="font31 m-0">Claim</p>
                        </button>`}
                                <div class="modal fade" id="modal1" tabindex="-1" role="dialog"
                                    aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered" role="document">
                                        <div class="modal-content rounded-3 bg1">
                                            <div class="modal-header text-light bbg2">
                                                <h5 class="modal-title font5" id="exampleModalLongTitle">CLAIM ITEM</h5>
                                                <button type="button"
                                                    class="btn-close btn-close-white btnn yellowbtn2 p-2 mx-2 text-light close border-0"
                                                    data-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <div class="border-bottom d-flex pb-5">
                                                    <img class="col-5 rounded mt-4" src="${item.image}" alt="">
                                                    <div class="my-auto px-3 text-start">
                                                        <p class="font8 mt-3 mb-0">${item.name}
                                                        </p>
                                                        <p class="font9 mb-0">${item.quantityLeft} Available</p><br>
                                                        <p class="my-auto tier px-2 rounded-pill widthfit">Tier ${item.tierId}</p>
                                                    </div>
                                                </div>
                                                <div class="mt-4 text-start">
                                                    <p class="font2">Please select the agent you would like to use to claim
                                                        this item:</p>
                                                    <div class="row">
                                                       ${agentsAvailable}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="modal-footer bbg2">
                                                <button type="button"
                                                    class="btn btnn yellowbtn2 font31 p-2 mx-2 text-light close"
                                                    data-dismiss="modal" aria-label="Close">CANCEL</button>
                                                <button type="button" class="btn btnn yellowbtn font31 p-2" onclick="claimItem('${item.id}');" id="claim-${item.id}" data-dismiss="modal" disabled>CLAIM
                                                    ITEM</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
        }

    })



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
        let res = await axios.post("https://mapi.artificialintelligenceclub.io/auth/", {
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
            fetchItems();
        } else {
            toastr.error(res.data.desc);
        }

    } else {
        let res = await axios.post("https://mapi.artificialintelligenceclub.io/isAuthValid/", {
            wallet: selectedAccount.toLowerCase(),
            token: localStorage.getItem("auth")
        })
        if (res.data.authenticated == false) {
            localStorage.clear();
            const web3 = new Web3(provider);
            let time = Math.floor(new Date().getTime() / 1000)
            let signature = await web3.eth.personal.sign(`${selectedAccount.toLowerCase()}+${time}`, selectedAccount);
            let res = await axios.post("https://mapi.artificialintelligenceclub.io/auth/", {
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
                fetchItems();
            } else {
                toastr.error(res.data.desc);
            }
        } else {
            fetchProfile();
            fetchHistory();
            fetchItems();
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