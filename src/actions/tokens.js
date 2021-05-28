import { createActions } from 'redux-actions'
import { wallet } from '../utils/wallet'
import { getLikelyContracts, getMetadata, getBalanceOf } from '../utils/tokens'

const WHITELISTED_CONTRACTS = (process.env.TOKEN_CONTRACTS || 'berryclub.ek.near,farm.berryclub.ek.near,wrap.near').split(',');

export const handleGetTokens = () => async (dispatch, getState) => {
    const { accountId } = getState().account

    await dispatch(tokens.likelyContracts.get(accountId))

    let contracts = [...new Set([...getState().tokens.likelyContracts, ...WHITELISTED_CONTRACTS])].reduce((x, contract) => ({
        ...x,
        [contract]: { contract }
    }), {})

    dispatch(tokens.tokensDetails.set(contracts))

    const account = await wallet.getAccount(accountId)

    await Promise.all(Object.keys(contracts).map(async contract => {
        await dispatch(tokens.tokensDetails.getMetadata(contract, account))
    }))

    Object.keys(contracts).map(async contract => {
        await dispatch(tokens.tokensDetails.getBalanceOf(contract, account, accountId))
    })
}

export const { tokens } = createActions({
    TOKENS: {
        LIKELY_CONTRACTS: {
            GET: [
                getLikelyContracts,
                () => WHITELISTED_CONTRACTS
            ],
        },
        TOKENS_DETAILS: {
            GET_METADATA: getMetadata,
            GET_BALANCE_OF: getBalanceOf
        },
        CLEAR_STATE: null
    }
})