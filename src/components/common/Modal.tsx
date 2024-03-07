import { Dialog } from "@headlessui/react"
import type { Dispatch, FC, ReactNode, SetStateAction } from "react"
import { HiX } from "react-icons/hi"

interface ModalProps {
	isOpen: boolean,
	openText: string,
	titleText: string,
	children: ReactNode,
	setIsOpen: Dispatch<SetStateAction<boolean>>
}

const Modal: FC<ModalProps> = ({ isOpen, openText, titleText, children, setIsOpen }) => {
	
	return (
		<>
			{!isOpen && 
				<button
						type="button" 
						onClick={() => setIsOpen(true)}
						className="bg-red-600 hover:bg-red-500 text-white py-1 px-4 text-2xl border-b-4 border-red-800 hover:border-red-600 rounded-xl">
						{openText}
				</button>
			}
			
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel className="w-full self-center mx-auto max-w-sm rounded bg-white">
						<Dialog.Title className="flex justify-between items-center px-2">
							{titleText}
							
							<HiX className="text-red-500 cursor-pointer" onClick={() => setIsOpen(false)} />
						</Dialog.Title>
						<div>{children}</div>
						
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	)
}

export default Modal