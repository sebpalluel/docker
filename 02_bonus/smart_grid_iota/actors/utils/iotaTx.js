const IOTA = require('iota.lib.js')
const storage = require('../storage')
const cloner = require('cloner')
var iota = new IOTA({
  provider: storage.iota_provider
})
const MAX_REPLAY = 5

var TYPE = {
  RECEIVING: {value: 0, name: 'Receiving from', code: 'R'},
  SPENDING: {value: 1, name: 'Sending from', code: 'S'},
  NOVALUE: {value: 2, name: 'address', code: 'N'}
}

var STATUS = {
  PENDING: {value: 0, name: 'pending'},
  REATTACHED: {value: 1, name: 'reattached'},
  CONFIRMED: {value: 2, name: 'confirmed'}
}

function txList (seed) {
  var Txs

  iota.api.getAccountData(seed, function (e, accountData) {
    if (e) { console.error(e) }
    console.log(accountData)
    const transfers = accountData.transfers.slice(0).reverse()
    const categorizedTransfers = iota.utils.categorizeTransfers(transfers, accountData.addresses)
    var Txs = extractTransfers(transfers, categorizedTransfers)
    return Txs
  })
}

function extractTransfers (transfers, categorizedTransfers) {
  const biggestValue = transfers.reduce(
    (biggest, bundle) => biggest > bundle[0].value ? biggest : bundle[0].value,
    0
  ) + ''
  const persistences = transfers.reduce(
    (persists, bundle) => {
      if (bundle[0].persistence && persists.indexOf(bundle[0].bundle) === -1) {
        persists.push(bundle[0].bundle)
      }
      return persists
    }, [])
  return (getTransfers(transfers, persistences, categorizedTransfers))
}

function getTransfers (transfers, persistences, categorizedTransfers) {
  var transferList = []

  transfers.forEach((bundle, index) => {
    const shortAddress = bundle[0].address
    const persisted = bundle[0].persistence
    let reattachConfirmed = false
    if (!persisted && persistences.indexOf(bundle[0].bundle) !== -1) {
      reattachConfirmed = true
    }

    const thisCategorizeTransfer = categorizedTransfers.sent.filter(t => t[0].hash === bundle[0].hash)
    const type = (bundle.length === 1 && bundle[0].value === 0 ? TYPE.NOVALUE : (thisCategorizeTransfer.length > 0 ? TYPE.SPENDING : TYPE.RECEIVING))
    var _status = (persisted ? STATUS.CONFIRMED : reattachConfirmed ? STATUS.REATTACHED : STATUS.PENDING)

    var message = iota.utils.extractJson(bundle)
    if (message) {
      // console.log('Extracted msg from transfer: ', message)
      // var jsonMessage = JSON.parse(message)
      // console.log('JSON: ', message)
      var newTx
      newTx = {
        'address': shortAddress,
        'type': type,
        'message': message,
        'value': bundle[0].value,
        'persistence': _status,
        'hash': bundle[0].hash + '<br/>' + bundle[0].bundle,
        'tstamp': bundle[0].attachmentTimestamp
      }
    } else {
      // console.log('transfer did not contain message')
      newTx = {
        'address': shortAddress,
        'type': type,
        'message': 'none',
        'value': 'none',
        'persistence': _status,
        'hash': bundle[0].hash + '<br/>' + bundle[0].bundle,
        'tstamp': bundle[0].attachmentTimestamp
      }
    }
    transferList.push(newTx)
  })
  return (transferList)
}

async function get_account (wallet, Txs, callback) {
  wallet.address = wallet.accountData.latestAddress
  if (wallet.accountData.addresses.length === 0) {
    console.log('get address acount: ' + wallet.address)
    new_address(wallet, callback)
  }
  else if (wallet.accountData.inputs.length > 0) {
    wallet.address = wallet.accountData.inputs[wallet.accountData.inputs.length - 1].address.toString()
    check_address(Txs, wallet, callback)
  }
  else {
    promote_address(wallet, callback)
  }
}

function getAccountInfoNew (wallet, callback0, callback1) {
  iota.api.getAccountData(wallet.seed, function (e, accountData) {
    if (e) { console.error(e) }
    var consoleData = {
      'latestAddress': accountData.latestAddress,
      'addresses': accountData.addresses,
      'inputs': accountData.inputs,
      'balance': accountData.balance
    }
    console.log(consoleData)
    const transfers = accountData.transfers.slice(0).reverse()
    const categorizedTransfers = iota.utils.categorizeTransfers(transfers, accountData.addresses)
    var Txs = extractTransfers(transfers, categorizedTransfers)
    wallet.accountData = cloner.deep.copy(accountData)
    callback0(wallet, Txs, callback1)
  })
}

function evalAddressReuse(Txs, address) {
  var newArr = Txs.filter(function(item){
    if (item.address == address && item.type == TYPE.SPENDING)
      return item
  })
}

async function replayBundle(wallet, hash, callback) {
  var minWeightMagnitude = 14 //  as in the light-wallet
  var depth = 1

  iota.api.getLatestInclusion(hash, (error, inclusionStates) => {
    if (error) {
      console.error('getLatestInclusion error', error)
    }
    else
    {
      var included = inclusionStates.find(function(element) {
        return element === true
      })
      if (included) {
        console.log('transaction is included (confirmed)! yay!')
        typeof callback === 'function' && callback(wallet)
      }
      else if (hash.length < MAX_REPLAY){
        // else {
        iota.api.replayBundle(hash[0], depth, minWeightMagnitude, (error, replayTransactions) => {
          if (error) {
            console.error('replayBundle error', error)
          }
          else
          {
            console.log('retrying to include transaction')
            hash.push(replayTransactions[0].hash)
            replayBundle(wallet, hash, callback)
            // setInterval(replayBundle, 5000, wallet, hash, callback)
          }
        })
      }
      else
      {
        replayBundle(wallet, hash, callback)
      }
    }
  })
}

async function promote_address(wallet, callback) {
  let transfer = [{
    'address': wallet.address.toString(),
    'value': 0,
    'message': iota.utils.toTrytes('Seb test')
  }]
  var minWeightMagnitude = 14 //  as in the light-wallet
  var depth = 1
  iota.api.sendTransfer(wallet.seed, depth, minWeightMagnitude, transfer, (e, bundle) => {
    if (e)
      console.error(e)
    else
    {
      console.log('sending spam tx to address '+wallet.address,' hash : '+JSON.stringify([bundle].hash))
      const spamTransfer = [{address: '9'.repeat(81), value: 0, message: '', tag: ''}]
      iota.api.promoteTransaction(bundle[0].hash, depth, minWeightMagnitude, spamTransfer,
        {interrupt: false, delay: 0},
        (err, res) => {
          if (err)
            console.error(err)
          else
          {
            var hash = []
            hash.push(bundle[0].hash)
            replayBundle(wallet, hash, callback)
          }
        })
    }
  })
}

async function send_value(address, value, wallet, callback)
{
  let transfer = [{
    'address': address.toString(),
    'value': value,
    'message': iota.utils.toTrytes('Seb test')
  }]
  var minWeightMagnitude = 14 //  as in the light-wallet
  var depth = 1
  iota.api.sendTransfer(wallet.seed, depth, minWeightMagnitude, transfer, (e, bundle) => {
    if (e)
      console.error(e)
    else
    {
      console.log('sending '+value, ' to address '+address,' hash : '+JSON.stringify(bundle[0].hash))
      const spamTransfer = [{address: '9'.repeat(81), value: 0, message: '', tag: ''}]
      iota.api.promoteTransaction(bundle[0].hash, 10, 14, spamTransfer,
        {interrupt: false, delay: 0},
        (err, res) => {
          if (err)
            console.error(err)
          else
          {
            var hash = []
            hash.push(bundle[0].hash)
            replayBundle(wallet, hash, callback)
          }
        })
    }
  })
}

async function check_address(Txs, wallet, callback) {
  if (evalAddressReuse(Txs, wallet.address) != undefined)
  {
    console.log('address : '+wallet.address,' has already been used for spending')
    new_address(wallet, callback)
  }
  else
    promote_address(wallet, callback)
}

async function new_address(wallet, callback) {
  iota.api.getNewAddress(wallet.address.toString(), {index: 0, total: 1, security: 1, checksum: true}, function(error, result) {
    if (error)
      console.error(e)
    wallet.address = result
    console.log('new address generation : '+result)
    promote_address(wallet, callback)
  });
}


module.exports = {

  getAccountInfoNew : getAccountInfoNew,

  evalAddressReuse : evalAddressReuse,

  replayBundle : replayBundle,

  promote_address : promote_address,

  send_value : send_value,

  check_address : check_address,

  new_address : new_address,

  get_account : get_account
}
