const ClickableName = ({ name, onClick }) => {
  return (
    <div className="clickable-name" onClick={onClick}>
      {name}
    </div>
  );
};

export default ClickableName;
