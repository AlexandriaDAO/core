import React, { useState, useRef } from "react";
import { Button } from "@/lib/components/button";
import { Mic, Square, Upload, Trash2, LoaderPinwheel } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { clearSelected, setSelected } from "@/features/sonora/sonoraSlice";
import { Audio } from "@/features/sonora/types";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";

const SonoraRecordPage: React.FC = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
	const [recordedUrl, setRecordedUrl] = useState<string>("");
	const [recordingTime, setRecordingTime] = useState(0);
	const [recordingError, setRecordingError] = useState<string>("");
	const { uploadAndMint, isProcessing, error: uploadError, success, progress, estimating, uploading, minting, resetUpload } = useUploadAndMint();
	
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const dispatch = useAppDispatch();
	const { selected } = useAppSelector((state) => state.sonora);

	const startRecording = async () => {
		try {
			setRecordingError("");
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			
			const chunks: BlobPart[] = [];
			
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};
			
			mediaRecorder.onstop = () => {
				const blob = new Blob(chunks, { type: 'audio/webm' });
				setRecordedBlob(blob);
				const url = URL.createObjectURL(blob);
				setRecordedUrl(url);
				
				// Automatically create audio data for preview
				const audioData: Audio = {
					id: url,
					type: 'audio/webm',
					size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
					timestamp: new Date().toISOString()
				};
				dispatch(setSelected(audioData));
			};
			
			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);
			
			// Start timer
			timerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
			
		} catch (err) {
			setRecordingError("Failed to access microphone. Please check permissions.");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			
			if (streamRef.current) {
				streamRef.current.getTracks().forEach(track => track.stop());
			}
		}
	};


	const deleteRecording = () => {
		if (recordedUrl) {
			URL.revokeObjectURL(recordedUrl);
		}
		setRecordedBlob(null);
		setRecordedUrl("");
		setRecordingTime(0);
		dispatch(clearSelected());
		// Reset upload state
		resetUpload();
	};

	const handleUpload = async () => {
		if (recordedBlob) {
			try {
				// Convert blob to File object
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				const fileName = `sonora-recording-${timestamp}.webm`;
				const file = new File([recordedBlob], fileName, { type: 'audio/webm' });
				
				const transactionId = await uploadAndMint(file);
				// Replace blob URL with Arweave transaction URL
				if (recordedUrl) {
					URL.revokeObjectURL(recordedUrl);
				}
				const arweaveUrl = `https://arweave.net/${transactionId}`;
				setRecordedUrl(arweaveUrl);
				
				// Update the audio data with Arweave URL
				const audioData: Audio = {
					id: transactionId, // Use transaction ID as the ID
					type: 'audio/webm',
					size: `${(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB`,
					timestamp: new Date().toISOString()
				};
				dispatch(setSelected(audioData));
				
				// Clear the blob reference but keep the UI showing the uploaded file
				setRecordedBlob(null);
			} catch (error) {
				// Error handling is done in the hook, keep recording for retry
			}
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className="flex-grow flex flex-col justify-center">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<p className="text-lg text-muted-foreground">
						Record audio content directly in your browser
					</p>
				</div>

				{/* Recording Interface */}
				<div>
					<div className="bg-card rounded-lg border p-8 text-center space-y-6">
						{/* Recording Status */}
						<div className="space-y-2">
							<div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
								isRecording 
									? 'bg-red-500 animate-pulse' 
									: recordedBlob 
									? 'bg-green-500' 
									: 'bg-muted'
							}`}>
								<Mic size={32} className="text-white" />
							</div>
							
							<div className="text-2xl font-mono">
								{formatTime(recordingTime)}
							</div>
							
							{isRecording && (
								<p className="text-sm text-red-500 animate-pulse">
									Recording in progress...
								</p>
							)}
							
							{recordedBlob && !isRecording && (
								<p className="text-sm text-green-600">
									Recording completed
								</p>
							)}
						</div>

						{/* Error Message */}
						{recordingError && (
							<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
								<p className="text-destructive text-sm">{recordingError}</p>
							</div>
						)}

						{/* Control Buttons */}
						<div className="flex justify-center gap-4">
							{!isRecording && !recordedBlob && (
								<Button onClick={startRecording} scale="lg" className="gap-2">
									<Mic size={20} />
									Start Recording
								</Button>
							)}
							
							{isRecording && (
								<Button onClick={stopRecording} variant="destructive" scale="lg" className="gap-2">
									<Square size={20} />
									Stop Recording
								</Button>
							)}
						</div>
					</div>

					{/* Upload option below recording box */}
					<div className="text-center mt-1">
						<p className="text-sm text-muted-foreground">
							<Link to="/app/sonora/upload">
								<Button
									variant="muted"
									scale="sm"
									className="gap-1 py-0 px-1 my-0"
								>
									or
									<Upload size={16} className="p-0"/>
									upload an existing audio file
								</Button>
							</Link>
						</p>
					</div>
				</div>

				{/* Audio Preview */}
				{(recordedBlob || recordedUrl) && selected && !isRecording && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium">
								{recordedBlob ? "Preview" : "Uploaded to Arweave"}
							</h3>
							<Button
								variant="ghost"
								scale="sm"
								onClick={deleteRecording}
								className="text-muted-foreground hover:text-foreground"
							>
								<Trash2 size={16} />
								{recordedBlob ? "Delete" : "Clear"}
							</Button>
						</div>
						<AudioCard item={selected} />
					</div>
				)}

				{/* Upload Error and Success Messages */}
				{uploadError && (
					<div className="text-center p-4 bg-destructive/10 border border-destructive rounded-lg">
						<p className="text-destructive font-medium">{uploadError}</p>
					</div>
				)}
				
				{success && (
					<div className="text-center p-4 bg-green-500/10 border border-green-500 rounded-lg">
						<p className="text-green-600 font-medium">{success}</p>
					</div>
				)}

				{/* Upload Button */}
				{recordedBlob && (
					<div className="flex justify-center">
						<Button 
							onClick={handleUpload} 
							className="gap-2"
							disabled={isProcessing || isRecording}
						>
							{isProcessing ? (
								<>
									<LoaderPinwheel size={16} className="animate-spin" />
									{estimating ? "Estimating..." : uploading ? `Uploading ${Math.round(progress)}%` : minting ? "Minting..." : "Processing..."}
								</>
							) : (
								<>
									<Upload size={16} />
									Upload & Mint NFT
								</>
							)}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SonoraRecordPage;