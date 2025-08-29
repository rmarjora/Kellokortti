const ClickableName = ({ name, onClick, hasArrived }) => {
  return (
    <div
      className="clickable-name"
      style={{ background: hasArrived ? '#e0ffe0' : undefined }}
      onClick={onClick}
    >
      {name}
    </div>
  );
};

export default ClickableName;
