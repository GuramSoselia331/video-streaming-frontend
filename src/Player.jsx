import { useEffect } from "react";
import ReactHlsPlayer from "react-hls-player";
import { useParams } from "react-router";

function Player() {
	const { streamid } = useParams();

	// useEffect(() => {
	// 	console.log(params);
	// }, []);
	return (
		<>
			<iframe
				title="videoplayer"
				src={`https://embed.api.video/live/${streamid}`}
				width={"100vh"}
				height={"100vh"}
				frameborder="0"
				allowfullscreen="true"
				style={{
					overflow: "hidden",
					height: "100%",
					width: "100%",
					position: "absolute",
					top: "0px",
					left: "0px",
					right: "0px",
					bottom: "0px",
				}}
			/>

			{/* <ReactHlsPlayer
				src={`https://live.api.video/${streamid}`}
				autoPlay={false}
				controls={true}
				width="100%"
				height="auto"
			/> */}
		</>
	);
}

export default Player;
