import {Fragment, PropsWithChildren, ReactNode, useRef} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {ExclamationIcon} from '@heroicons/react/outline'
import {useTransition} from 'remix'

interface Props {
  open: boolean
  title: string
  content: ReactNode
  submitLabel?: string
  cancelLabel?: string
  onSubmit?: () => void
  onCancel?: () => void
  disabled?: boolean
}

export default function Modal({
  open,
  title,
  content,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  onSubmit = () => {},
  onCancel = () => {},
  disabled = false,
}: PropsWithChildren<Props>) {
  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onCancel}
      >
        <div className="flex items-end justify-center pb-20 pt-4 px-4 min-h-screen text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom text-left bg-white rounded-lg shadow-xl overflow-hidden transform transition-all sm:align-middle sm:my-8 sm:w-full sm:max-w-lg">
              <div className="pb-4 pt-5 px-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex flex-shrink-0 items-center justify-center mx-auto w-12 h-12 bg-red-100 rounded-full sm:mx-0 sm:w-10 sm:h-10">
                    <ExclamationIcon
                      className="w-6 h-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-gray-900 text-lg font-medium leading-6"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2 text-gray-500 text-sm">{content}</div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 w-full text-white text-base font-medium bg-red-600 hover:bg-red-700 border border-transparent rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onSubmit}
                  disabled={disabled}
                >
                  {submitLabel}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center mt-3 px-4 py-2 w-full text-gray-700 text-base font-medium hover:bg-gray-50 bg-white border border-gray-300 rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onCancel}
                  ref={cancelButtonRef}
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
