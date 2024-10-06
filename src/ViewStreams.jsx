import { useEffect, useState } from "react";

const ViewStreams = () => {
	const [streams, setStreams] = useState([]);

	const fetchStreams = async () => {
		try {
			const request = await fetch("https://elects.space/streams");
			const res = await request.json();
			setStreams(res.data);
		} catch (err) {
			console.log("Could not fetch streams", err);
		}
	};

	useEffect(() => {
		fetchStreams();
	}, []);

	return (
		<>
			{streams.map((stream, index) => (
				<div style={{ display: "grid" }} key={index}>
					<iframe src={stream.assets.player} allowfullscreen={true} />
				</div>
			))}
		</>
	);
};
export default ViewStreams;
