// OG: Now makes author object from pure AUTHOR_INFO
import React, { createContext, useContext, ReactNode, useState, useRef } from 'react';
import * as webllm from "@mlc-ai/web-llm";



export enum LoadStatus {
	NotInitialized = 0,
	Initialized,
	Complete,
}

interface AIContextProps {
  model: webllm.ChatModule | undefined,
  // setModel: React.Dispatch<React.SetStateAction<webllm.ChatModule | undefined>>,

  loadStatus: Number,
  // setLoadStatus:React.Dispatch<React.SetStateAction<Number>>,

  initRef: React.RefObject<HTMLDivElement>

  loadModel: () => Promise<void>


  working: any
  setWorking: React.Dispatch<React.SetStateAction<any>>,

}

const AIContext = createContext<AIContextProps | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [model, setModel] = useState<webllm.ChatModule>();
  const [working, setWorking] = useState<any>(null);
	const [loadStatus, setLoadStatus] = useState<Number>(
		LoadStatus.NotInitialized
	);
  const initRef = useRef<HTMLDivElement>(null);

  const loadModel = async () => {
		if (loadStatus == LoadStatus.Initialized) return;

		if (loadStatus == LoadStatus.Complete && model) return;

		setLoadStatus(LoadStatus.Initialized);

		// create a ChatModule,
		const chat = new webllm.ChatModule();

		// This callback allows us to report initialization progress
		chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
      if (initRef.current == null) {
        throw Error("Cannot find ref");
      }else{
        initRef.current.innerText = report.text;
      }
		});

		// Default models are
    // RedPajama-INCITE-Chat-3B-v1-q4f32_1    // working
		// Llama-2-7b-chat-hf-q4f32_1             // not working
		// https://github.com/mlc-ai/web-llm/blob/main/examples/simple-chat/src/gh-config.js

		await chat.reload('RedPajama-INCITE-Chat-3B-v1-q4f32_1');

		setLoadStatus(LoadStatus.Complete);

		setModel(chat);
	};

  return (
    <AIContext.Provider value={{ model, loadStatus, initRef, loadModel, working, setWorking }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used inside an AIProvider');
  }
  return context;
};