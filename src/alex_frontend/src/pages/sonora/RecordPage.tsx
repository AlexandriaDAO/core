import React, { useState, useRef } from "react";
import { Button } from "@/lib/components/button";
import { Mic, Square, Play, Upload, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { playAudio, clearSelected } from "@/features/sonora/sonoraSlice";
import { Audio } from "@/features/sonora/types";

const SonoraRecordPage: React.FC = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
	const [recordedUrl, setRecordedUrl] = useState<string>("");
	const [recordingTime, setRecordingTime] = useState(0);
	const [error, setError] = useState<string>("");
	
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const dispatch = useAppDispatch();

	const startRecording = async () => {
		try {
			setError("");
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
			};
			
			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);
			
			// Start timer
			timerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
			
		} catch (err) {
			setError("Failed to access microphone. Please check permissions.");
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

	const playRecording = () => {
		if (recordedUrl && recordedBlob) {
			// Create Audio object for Redux
			const audioData: Audio = {
				id: recordedUrl, // Use object URL as ID for recorded files
				type: 'audio/webm',
				size: `${(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB`,
				timestamp: new Date().toISOString()
			};
			
			dispatch(playAudio(audioData));
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
	};

	const handleUpload = () => {
		if (recordedBlob) {
			// TODO: Implement upload logic
			console.log("Uploading recorded audio");
			alert("Upload functionality coming soon!");
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
					{error && (
						<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
							<p className="text-destructive text-sm">{error}</p>
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
						
						{recordedBlob && !isRecording && (
							<>
								<Button onClick={playRecording} variant="outline" className="gap-2">
									<Play size={16} />
									Preview
								</Button>
								<Button onClick={deleteRecording} variant="outline" className="gap-2">
									<Trash2 size={16} />
									Delete
								</Button>
								<Button onClick={handleUpload} className="gap-2">
									<Upload size={16} />
									Upload & Mint NFT
								</Button>
							</>
						)}
					</div>
				</div>

				{/* Upload option */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						or{" "}
						<Link to="/app/sonora/upload" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
							upload an existing audio file
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default SonoraRecordPage;