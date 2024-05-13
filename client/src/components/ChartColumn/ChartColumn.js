import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap';
import ChartDataLabels from 'chartjs-plugin-zoom'; // Import ChartDataLabels từ 'chartjs-plugin-zoom'

function ChartColumn({ data, name, unit, update }) {
    const [zoomScale, setZoomScale] = useState(1);
    const [isHovered, setIsHovered] = useState(false); // Biến trạng thái hover

    const gradientStroke = React.useMemo(() => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
        gradientStroke.addColorStop(1, 'rgba(72,72,176,0.1)');
        gradientStroke.addColorStop(0.4, 'rgba(72,72,176,0.0)');
        gradientStroke.addColorStop(0, 'rgba(119,52,169,0)'); //purple colors
        return gradientStroke;
    }, []);

    if (!data || data.length === 0) {
        return null; // Return null nếu không có dữ liệu
    }

    const Data = data.map((item) => parseInt(item.temperature));
    const chartData = {
        labels: ['', '', '', '', '', '', '', ''],
        datasets: [
            {
                label: unit,
                fill: true,
                backgroundColor: gradientStroke,
                hoverBackgroundColor: gradientStroke,
                borderColor: '#d048b6',
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                data: Data,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy', // Cho phép kéo theo cả hai trục x và y
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'xy', // Cho phép zoom theo cả hai trục x và y
                },
            },
        },
    };

    // Hàm xử lý khi thực hiện zoom
    const handleZoomIn = () => {
        setZoomScale(zoomScale * 1.1);
    };

    const handleZoomOut = () => {
        setZoomScale(zoomScale * 0.9);
    };

    const handleResetZoom = () => {
        setZoomScale(1); // Đặt tỉ lệ zoom về 1
    };
    const handleMouseLeave = () => {
        handleResetZoom();
    };
    return (
        <Card className="card-chart">
            <CardHeader>
                <div className="d-flex justify-content-between">
                    <h5 className="card-category">
                        {update === 'en'
                            ? `Update at ${data?.[data.length - 1]?.date}`
                            : `Cập nhật lúc ${data?.[data.length - 1]?.date}`}
                    </h5>
                    <div>
                        <span
                            style={{ fontSize: '1.3rem', cursor: 'pointer' }}
                            onClick={handleZoomIn}
                            className="material-icons"
                        >
                            zoom_in
                        </span>
                        <span
                            style={{ fontSize: '1.3rem', cursor: 'pointer' }}
                            onClick={handleZoomOut}
                            className="material-icons"
                        >
                            zoom_out
                        </span>
                        <span
                            style={{ fontSize: '1.3rem', cursor: 'pointer' }}
                            onClick={handleResetZoom}
                            className="material-icons"
                        >
                            zoom_out_map
                        </span>
                    </div>
                </div>
                <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" /> {name}
                </CardTitle>
            </CardHeader>
            <CardBody style={{ minHeight: '250px' }}>
                <div
                    className="chart-area"
                    style={{ height: '100%', overflow: 'hidden' }}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        style={{
                            transform: `scale(${zoomScale})`,
                            transition: 'transform 0.1s ease-in-out',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Bar
                            style={{ height: '220px' }}
                            data={chartData}
                            options={options}
                            plugins={[ChartDataLabels]}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

export default ChartColumn;
