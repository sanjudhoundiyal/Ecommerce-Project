import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const handleSearch = () => {
  navigate(`/search/${encodeURIComponent(keyword)}`);
};
export default handleSearch;