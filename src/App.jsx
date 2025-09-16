// import React, { useEffect, useRef, useState } from 'react';
// import * as faceapi from 'face-api.js';

// const FaceRecognitionApp = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [isModelLoaded, setIsModelLoaded] = useState(false);
//   const [isVideoStarted, setIsVideoStarted] = useState(false);
//   const [statusMessage, setStatusMessage] = useState('Loading models...');

//   useEffect(() => {
//     loadModels();
//   }, []);

//   const loadModels = async () => {
//     try {
//       setStatusMessage('Loading face detection models...');
      
//       // Load models from public folder
//       const MODEL_URL = '/models';
      
//       await Promise.all([
//         faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
//         faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//         faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//         faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
//       ]);
      
//       setIsModelLoaded(true);
//       setStatusMessage('Models loaded successfully! Click "Start Camera" to begin.');
//     } catch (error) {
//       console.error('Error loading models:', error);
//       setStatusMessage('Error loading models. Please check console for details.');
//     }
//   };

//   const startWebcam = async () => {
//     try {
//       setStatusMessage('Starting camera...');
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false
//       });
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setIsVideoStarted(true);
//         setStatusMessage('Camera started! Processing faces...');
//       }
//     } catch (error) {
//       console.error('Error accessing webcam:', error);
//       setStatusMessage('Error accessing camera. Please ensure camera permissions are granted.');
//     }
//   };

//   const stopWebcam = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject;
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//       setIsVideoStarted(false);
//       setStatusMessage('Camera stopped.');
      
//       // Clear canvas
//       if (canvasRef.current) {
//         const ctx = canvasRef.current.getContext('2d');
//         ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//       }
//     }
//   };

//   const getLabeledFaceDescriptions = async () => {
//     // Define the labels - these should match your folder names in public/labels/
//     const labels = ["Messi", "Data"]; // Modify these based on your actual labels
    
//     return Promise.all(
//       labels.map(async (label) => {
//         const descriptions = [];
        
//         // Load 2 images per label (you can adjust this number)
//         for (let i = 1; i <= 2; i++) {
//           try {
//             const img = await faceapi.fetchImage(`/labels/${label}/${i}.png`);
//             const detections = await faceapi
//               .detectSingleFace(img)
//               .withFaceLandmarks()
//               .withFaceDescriptor();
            
//             if (detections) {
//               descriptions.push(detections.descriptor);
//             }
//           } catch (error) {
//             console.error(`Error loading image for ${label}/${i}.png:`, error);
//           }
//         }
        
//         if (descriptions.length > 0) {
//           return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         }
//         return null;
//       })
//     ).then(results => results.filter(result => result !== null));
//   };

//   const handleVideoPlay = async () => {
//     if (!videoRef.current || !canvasRef.current) return;
    
//     const labeledFaceDescriptors = await getLabeledFaceDescriptions();
//     const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    
//     const canvas = canvasRef.current;
//     const displaySize = { 
//       width: videoRef.current.videoWidth, 
//       height: videoRef.current.videoHeight 
//     };
    
//     faceapi.matchDimensions(canvas, displaySize);
    
//     const detectFaces = async () => {
//       if (!videoRef.current || !isVideoStarted) return;
      
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current)
//         .withFaceLandmarks()
//         .withFaceDescriptors();
      
//       const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
//       const ctx = canvas.getContext('2d');
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       const results = resizedDetections.map((d) => {
//         return faceMatcher.findBestMatch(d.descriptor);
//       });
      
//       results.forEach((result, i) => {
//         const box = resizedDetections[i].detection.box;
//         const drawBox = new faceapi.draw.DrawBox(box, {
//           label: result.toString()
//         });
//         drawBox.draw(canvas);
//       });
      
//       if (isVideoStarted) {
//         requestAnimationFrame(detectFaces);
//       }
//     };
    
//     detectFaces();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-4xl font-bold text-white text-center mb-8 tracking-wider">
//           Face Recognition System
//         </h1>
        
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
//             <div className="mb-6">
//               <p className="text-white text-center text-sm mb-4">{statusMessage}</p>
              
//               <div className="flex justify-center gap-4">
//                 <button
//                   onClick={startWebcam}
//                   disabled={!isModelLoaded || isVideoStarted}
//                   className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
//                     !isModelLoaded || isVideoStarted
//                       ? 'bg-gray-500 cursor-not-allowed opacity-50'
//                       : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
//                   }`}
//                 >
//                   Start Camera
//                 </button>
                
//                 <button
//                   onClick={stopWebcam}
//                   disabled={!isVideoStarted}
//                   className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
//                     !isVideoStarted
//                       ? 'bg-gray-500 cursor-not-allowed opacity-50'
//                       : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
//                   }`}
//                 >
//                   Stop Camera
//                 </button>
//               </div>
//             </div>
            
//             <div className="relative flex justify-center items-center">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 muted
//                 onPlay={handleVideoPlay}
//                 className="rounded-lg shadow-2xl"
//                 width="600"
//                 height="450"
//                 style={{ display: isVideoStarted ? 'block' : 'none' }}
//               />
              
//               <canvas
//                 ref={canvasRef}
//                 className="absolute top-0 left-0"
//                 style={{ display: isVideoStarted ? 'block' : 'none' }}
//               />
              
//               {!isVideoStarted && (
//                 <div className="w-[600px] h-[450px] bg-black/30 rounded-lg flex items-center justify-center">
//                   <div className="text-center">
//                     <svg className="w-24 h-24 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                     <p className="text-white/70">Camera preview will appear here</p>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="mt-6 text-center">
//               <p className="text-white/70 text-sm">
//                 Ensure good lighting and face the camera directly for best results
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FaceRecognitionApp;



import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognitionApp = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading models...');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setStatusMessage('Loading face detection models...');
      
      // Load models from public folder
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      setIsModelLoaded(true);
      setStatusMessage('Models loaded successfully! Click "Start Camera" to begin.');
    } catch (error) {
      console.error('Error loading models:', error);
      setStatusMessage('Error loading models. Please check console for details.');
    }
  };

  const startWebcam = async () => {
    try {
      setStatusMessage('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoStarted(true);
        setStatusMessage('Camera started! Processing faces...');
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setStatusMessage('Error accessing camera. Please ensure camera permissions are granted.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsVideoStarted(false);
      setStatusMessage('Camera stopped.');
      
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const getLabeledFaceDescriptions = async () => {
    // Define the labels - these should match your folder names in public/labels/
    const labels = ["Messi", "Data"]; // Modify these based on your actual labels
    
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        
        // Load 2 images per label (you can adjust this number)
        for (let i = 1; i <= 2; i++) {
          try {
            const img = await faceapi.fetchImage(`/labels/${label}/${i}.png`);
            const detections = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();
            
            if (detections) {
              descriptions.push(detections.descriptor);
            }
          } catch (error) {
            console.error(`Error loading image for ${label}/${i}.png:`, error);
          }
        }
        
        if (descriptions.length > 0) {
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        }
        return null;
      })
    ).then(results => results.filter(result => result !== null));
  };

  const handleVideoPlay = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const labeledFaceDescriptors = await getLabeledFaceDescriptions();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    
    const canvas = canvasRef.current;
    const displaySize = { 
      width: videoRef.current.videoWidth, 
      height: videoRef.current.videoHeight 
    };
    
    faceapi.matchDimensions(canvas, displaySize);
    
    const detectFaces = async () => {
      if (!videoRef.current || !isVideoStarted) return;
      
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });
      
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString()
        });
        drawBox.draw(canvas);
      });
      
      if (isVideoStarted) {
        requestAnimationFrame(detectFaces);
      }
    };
    
    detectFaces();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8 tracking-wider">
          Face Recognition System
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
            <div className="mb-6">
              <p className="text-white text-center text-sm mb-4">{statusMessage}</p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={startWebcam}
                  disabled={!isModelLoaded || isVideoStarted}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    !isModelLoaded || isVideoStarted
                      ? 'bg-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                  }`}
                >
                  Start Camera
                </button>
                
                <button
                  onClick={stopWebcam}
                  disabled={!isVideoStarted}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    !isVideoStarted
                      ? 'bg-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  }`}
                >
                  Stop Camera
                </button>
              </div>
            </div>
            
            <div className="relative inline-block mx-auto">
              <video
                ref={videoRef}
                autoPlay
                muted
                onPlay={handleVideoPlay}
                className="rounded-lg shadow-2xl block"
                width="600"
                height="450"
                style={{ display: isVideoStarted ? 'block' : 'none' }}
              />
              
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ display: isVideoStarted ? 'block' : 'none' }}
              />
              
              {!isVideoStarted && (
                <div className="w-[600px] h-[450px] bg-black/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/70">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Ensure good lighting and face the camera directly for best results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionApp;