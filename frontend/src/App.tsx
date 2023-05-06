import { ChangeEvent, useEffect, useState } from 'react'
import {
	AppConfig,
	UserSession,
	AuthDetails,
	showConnect,
	UserData,
} from '@stacks/connect'

function App() {
	const appConfig = new AppConfig(['store_write'])
	const userSession = new UserSession({ appConfig })
	const appDetails = {
		name: 'Hello Stacks',
		icon: 'https://freesvg.org/img/1541103084.png',
	}

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

	useEffect(() => {
		if (userData) {
			console.log('userData', userData)
		}
	}, [userData])

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

	const submitMessage = () => {
		// submit transaction
	}

	const handleTransactionChange = (e: ChangeEvent<HTMLInputElement>) => {
		setTransactionId(e.target.value)
	}

	const retrieveMessage = () => {
		// submit transaction
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
				<p className="text-2xl">{currentMessage}</p>
			) : (
				''
			)}
		</div>
	)
}

export default App
