import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import VoiceRecognizer from './components/voiceRecognizer';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
    <div>
      <h1>Chat-App</h1>
      <VoiceRecognizer />
    </div>
    </>
  )
}
