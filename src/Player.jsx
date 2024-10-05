import ReactHlsPlayer from "react-hls-player";

function Player() {
	return (
		<>
			<ReactHlsPlayer
				src="https://live.api.video/li4gyV9zOkkn1uQRfd219vth.m3u8"
				autoPlay={false}
				controls={true}
				width="100%"
				height="auto"
			/>
		</>
	);
}

export default Player;
