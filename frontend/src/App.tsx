import {
	AppConfig,
	UserData,
	UserSession,
	openContractCall,
	showConnect,
} from '@stacks/connect'
import { StacksMocknet } from '@stacks/network'
import { stringUtf8CV } from '@stacks/transactions'
import { ChangeEvent, PointerEvent, useEffect, useState } from 'react'
import { ofetch } from 'ofetch'

function App() {
	const appConfig = new AppConfig(['store_write'])
	const userSession = new UserSession({ appConfig })
	const appDetails = {
		name: 'Hello Stacks',
		icon: 'https://avatars.githubusercontent.com/u/46557266?v=4',
	} as const
	const contract = {
		address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
		name: 'hello-stacks',
	} as const

	const [userData, setUserData] = useState<UserData | undefined>(undefined)
	const [message, setMessage] = useState('')
	const [transactionId, setTransactionId] = useState('')
	const [currentMessage, setCurrentMessage] = useState('')

	const reloadPage = () => {
		window.location.reload()
	}

	useEffect(() => {
		if (userSession.isSignInPending()) {
			userSession.handlePendingSignIn().then((userData) => {
				setUserData(userData)
			})
		} else if (userSession.isUserSignedIn()) {
			setUserData(userSession.loadUserData())
		}
	}, [])

	const connectWallet = () => {
		showConnect({
			appDetails,
			userSession,
			onFinish: reloadPage,
		})
	}

	const disconnectWallet = () => {
		userSession.signUserOut()
		reloadPage()
	}

	const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
		setMessage(e.target.value)
	}

	const submitMessage = async (e: PointerEvent<HTMLButtonElement>) => {
		e.preventDefault()

		const network = new StacksMocknet()

		const options = {
			contractAddress: contract.address,
			contractName: contract.name,
			functionName: 'write-message',
			functionArgs: [stringUtf8CV(message)],
			network,
			appDetails,
			onFinish: ({ txId }: { txId: string }) => {
				console.log('tx id:', txId)
				setMessage('')
				setTransactionId(txId)
			},
		}

		await openContractCall(options)
	}

	const handleTransactionChange = (e: ChangeEvent<HTMLInputElement>) => {
		setTransactionId(e.target.value)
	}

	const retrieveMessage = async () => {
		type TxEvent = {
			limit: number
			offset: number
			events: {
				event_index: number
				event_type: string
				tx_id: string
				contract_log: {
					contract_id: string
					topic: string
					value: {
						hex: string
						repr: string
					}
				}
			}[]
		}

		try {
			const retrievedMessage = await ofetch<TxEvent>(
				'http://localhost:3999/extended/v1/tx/events',
				{
					query: {
						tx_id: transactionId,
					},
				}
			)

			const message = retrievedMessage.events[0].contract_log.value.repr

			const match = message.match(/"([^"]*)"/)

			if (match) {
				const parsedMessage = match.at(1) as string
				setCurrentMessage(parsedMessage)
			}
		} catch (error) {
			console.error(error)
		}
	}

	const clearCurrentMessage = () => {
		setTransactionId('')
		setCurrentMessage('')
	}

	return (
		<div className="flex flex-col justify-center items-center h-screen gap-8">
			{!userSession.isUserSignedIn() ? (
				<button
					className="p-4 bg-indigo-500 rounded text-white"
					onClick={connectWallet}
				>
					Connect Wallet
				</button>
			) : (
				<button
					className="p-4 bg-indigo-200 rounded text-indigo-800"
					onClick={disconnectWallet}
				>
					Sign out
				</button>
			)}

			<h1 className="text-6xl font-black">Hello Stacks</h1>

			{userData && (
				<div className="grid grid-cols-3 gap-4">
					<input
						className="p-4 border border-indigo-500 rounded col-span-2"
						placeholder="Write message here..."
						onChange={handleMessageChange}
						value={message}
					/>
					<button
						className="p-4 bg-indigo-500 rounded text-white"
						onClick={submitMessage}
					>
						Submit New Message
					</button>

					<input
						className="p-4 border border-indigo-500 rounded col-span-2"
						placeholder="Paste transaction ID to look up message"
						onChange={handleTransactionChange}
						value={transactionId}
					/>
					<button
						className="p-4 bg-indigo-500 rounded text-white"
						onClick={retrieveMessage}
					>
						Retrieve Message
					</button>
				</div>
			)}

			{currentMessage.length > 0 ? (
				<div className="flex flex-col gap-2 justify-center items-center">
					<p className="text-2xl">{currentMessage}</p>
					<button
						className="px-2 py-1 bg-indigo-200 rounded text-indigo-900"
						onClick={clearCurrentMessage}
					>
						Clear
					</button>
				</div>
			) : (
				''
			)}
		</div>
	)
}

export default App
